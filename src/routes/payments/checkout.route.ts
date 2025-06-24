import { Router, Request, Response } from "express";
import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OrdersController,
  OrderRequest,
} from "@paypal/paypal-server-sdk";
import { PrismaClient } from "@prisma/client";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  throw new Error("Missing PayPal credentials in environment variables.");
}
const prisma = new PrismaClient();

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  timeout: 0,
  environment: Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true },
  },
});

const ordersController = new OrdersController(client);

interface CartItem {
  name: string;
  unitAmount: {
    currencyCode: string;
    value: string;
  };
  quantity: string;
  description?: string;
  sku?: string;
}

interface Cart {
  items: CartItem[];
}

const paypalRouter = Router();

const createOrder = async (cart: Cart) => {
  const total = cart.items.reduce((sum, item) => {
    return sum + Number(item.unitAmount.value) * Number(item.quantity);
  }, 0);

  const precioUSD = total.toFixed(2);

  const collect: { body: OrderRequest; prefer: string } = {
    body: {
      intent: "CAPTURE" as CheckoutPaymentIntent,
      purchaseUnits: [
        {
          amount: {
            currencyCode: "USD",
            value: String(precioUSD),
            breakdown: {
              itemTotal: {
                currencyCode: "USD",
                value: String(precioUSD),
              },
            },
          },
          items: cart.items,
        },
      ],
    },
    prefer: "return=minimal",
  };

  try {
    const { body, ...httpResponse } = await ordersController.createOrder(
      collect
    );

    let parsedBody: any;
    if (typeof body === "string") {
      parsedBody = JSON.parse(body);
    } else if (Buffer.isBuffer(body)) {
      parsedBody = JSON.parse(body.toString("utf-8"));
    } else {
      throw new Error("Unexpected body type in response");
    }

    return {
      jsonResponse: parsedBody,
      httpStatusCode: httpResponse.statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw error;
  }
};

const captureOrder = async (orderID: string) => {
  try {
    const { body, ...httpResponse } = await ordersController.captureOrder({
      id: orderID,
    });

    let parsedBody: any;
    if (typeof body === "string") {
      parsedBody = JSON.parse(body);
    } else if (Buffer.isBuffer(body)) {
      parsedBody = JSON.parse(body.toString("utf-8"));
    } else if (typeof body === "object") {
      parsedBody = body;
    } else {
      throw new Error("Unexpected body type in response");
    }

    return {
      jsonResponse: parsedBody,
      httpStatusCode: httpResponse.statusCode,
    };
  } catch (error) {
    console.error("Error en captura PayPal:", error);
    if (error instanceof ApiError) {
      console.error("Detalle PayPal:", error.message, error);
    }
    throw new Error("Failed to capture order.");
  }
};

paypalRouter.post("/orders", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId in request Body" });
    }

    const carrito = await prisma.cARRITO.findUnique({
      where: { usuario_fk: userId },
      include: {
        items: {
          include: {
            producto: true,
            talla: true,
          },
        },
      },
    });

    if (!carrito || carrito.items.length === 0) {
      return res.status(404).json({ error: "Carrito vacío o no encontrado." });
    }

    const tipoCambio = 36.5;
    const items: CartItem[] = carrito.items.map((item) => {
      const precioCordobas = item.producto.precioVenta.toNumber();
      const precioUSD = parseFloat((precioCordobas / tipoCambio).toFixed(2));

      return {
        name: item.producto.nombre,
        quantity: item.cantidad.toString(),
        unitAmount: {
          currencyCode: "USD",
          value: precioUSD.toFixed(2),
        },
        description: item.producto.descripcion || "",
        sku: `PROD-${item.producto_fk}`, // <-- Corrige aquí, ahora es string
      };
    });

    const cart: Cart = { items };
    const { jsonResponse, httpStatusCode } = await createOrder(cart);

    return res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    return res.status(500).json({ error: "Failed to create order." });
  }
});

paypalRouter.post(
  "/orders/:orderID/capture",
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res
          .status(400)
          .json({ error: "Missing userId in request body" });
      }
      const { orderID } = req.params;

      const { jsonResponse, httpStatusCode } = await captureOrder(orderID);

      const purchaseUnits = jsonResponse.purchase_units || [];
      const payer = jsonResponse.payer || {};
      const paymentStatus = jsonResponse.status;

      const orden = await prisma.oRDENES.create({
        data: {
          orderId: orderID,
          usuario_fk: userId,
          estado: paymentStatus,
          payerEmail: payer.email_address || null,
          payerName: payer.name
            ? `${payer.name.given_name} ${payer.name.surname}`
            : null,
          total:
            purchaseUnits.length > 0
              ? parseFloat(purchaseUnits[0].payments.captures[0].amount.value)
              : 0,
          moneda:
            purchaseUnits.length > 0
              ? purchaseUnits[0].payments.captures[0].amount.currency_code
              : null,
        },
      });

      const carrito = await prisma.cARRITO.findUnique({
        where: { usuario_fk: userId },
        include: {
          items: {
            include: {
              producto: true,
            },
          },
        },
      });

      if (!carrito?.items || carrito.items.length === 0) {
        throw new Error("El carrito no tiene ítems cargados");
      }

      const ordenItemsData = [];

      for (const item of carrito.items) {
        const precioCordobas = item.producto.precioVenta.toNumber();
        const tipoCambio = 36.84;
        const precioUSD = parseFloat((precioCordobas / tipoCambio).toFixed(2));
        const subtotalUSD = parseFloat(
          ((precioCordobas * item.cantidad) / tipoCambio).toFixed(2)
        );

        const ordenItem = await prisma.oRDEN_ITEM.create({
          data: {
            orden_fk: orden.orden_pk,
            producto_fk: item.producto_fk,
            talla_fk: item.talla_fk,
            cantidad: item.cantidad,
            precio_unitario_usd: precioUSD,
            subtotal_usd: subtotalUSD,
          },
        });
        ordenItemsData.push(ordenItem);
      }

      // Generar folio para la factura, por ejemplo FACT-2025-001 (puedes hacer lógica real para auto-incrementar)
      const año = new Date().getFullYear();
      const count = await prisma.factura.count({
        where: {
          fecha: {
            gte: new Date(`${año}-01-01T00:00:00.000Z`),
            lt: new Date(`${año + 1}-01-01T00:00:00.000Z`),
          },
        },
      });
      // Aquí deberías consultar la última factura para sacar el número, ejemplo hardcode:
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      const folio = `FACT-${año}-${(count + 1)
        .toString()
        .padStart(3, "0")}-${random}`;

      const shippingAddress = purchaseUnits[0]?.shipping?.address || {}; // Puede no venir, así que manejar caso null
      const direccionCompleta = [
        shippingAddress.address_line_1,
        shippingAddress.address_line_2,
        shippingAddress.admin_area_2, // ciudad
        shippingAddress.admin_area_1, // estado
        shippingAddress.postal_code,
        shippingAddress.country_code,
      ]
        .filter(Boolean) // elimina nulls/undefined
        .join(", ");

      const metodoPago = jsonResponse.payment_source?.card
        ? "Tarjeta"
        : jsonResponse.payment_source?.paypal
        ? "PayPal"
        : "Desconocido";

      const telefono = payer.phone?.phone_number?.national_number || null;

      const persona = await prisma.pERSONA.findUnique({
        where: { usuario_fk: userId },
      });

      const nombreCliente = persona
        ? `${persona.nombres} ${persona.apellidos}`
        : "Cliente";

      const factura = await prisma.factura.create({
        data: {
          orden_id: orden.orden_pk,
          fecha: new Date(),
          nombreCliente: nombreCliente || "Cliente",
          total: orden.total,
          folio,
          direccion: direccionCompleta || null,
          telefono: telefono,
          metodoPago: metodoPago,
        },
      });

      // Crear los FacturaItem para enlazar cada ordenItem a la factura
      for (const ordenItem of ordenItemsData) {
        await prisma.facturaItem.create({
          data: {
            factura_id: factura.factura_pk,
            orden_item_id: ordenItem.orden_item_pk,
          },
        });
      }

      for (const item of carrito.items) {
        if (item.talla_fk) {
          await prisma.tALLA.update({
            where: { talla_pk: item.talla_fk },
            data: {
              cantidad: { decrement: item.cantidad },
            },
          });

          // Verificar si todas las tallas del producto están en 0
          const tallasProducto = await prisma.tALLA.findMany({
            where: { producto_fk: item.producto_fk },
          });

          const todasAgotadas = tallasProducto.every((t) => t.cantidad === 0);

          if (tallasProducto.length > 0 && todasAgotadas) {
            await prisma.pRODUCTOS.update({
              where: { producto_pk: item.producto_fk },
              data: { estado: "Agotado" },
            });
          }
        }
      }

      if (carrito) {
        await prisma.cARRITO_ITEM.deleteMany({
          where: {
            carrito_fk: carrito.carrito_pk,
          },
        });
        await prisma.cARRITO.update({
          where: { carrito_pk: carrito.carrito_pk },
          data: { total: 0 },
        });
      }

      return res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
      console.error("Failed to capture order:", error);
      return res.status(500).json({ error: "Failed to capture order." });
    }
  }
);

export default paypalRouter;
