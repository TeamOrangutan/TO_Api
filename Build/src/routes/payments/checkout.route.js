"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paypal_server_sdk_1 = require("@paypal/paypal-server-sdk");
const client_1 = require("@prisma/client");
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("Missing PayPal credentials in environment variables.");
}
const prisma = new client_1.PrismaClient();
const client = new paypal_server_sdk_1.Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: PAYPAL_CLIENT_ID,
        oAuthClientSecret: PAYPAL_CLIENT_SECRET,
    },
    timeout: 0,
    environment: paypal_server_sdk_1.Environment.Production,
    logging: {
        logLevel: paypal_server_sdk_1.LogLevel.Info,
        logRequest: { logBody: true },
        logResponse: { logHeaders: true },
    },
});
console.log("Entorno PayPal:", client);
const ordersController = new paypal_server_sdk_1.OrdersController(client);
const paypalRouter = (0, express_1.Router)();
const createOrder = (cart) => __awaiter(void 0, void 0, void 0, function* () {
    const total = cart.items.reduce((sum, item) => {
        return sum + Number(item.unitAmount.value) * Number(item.quantity);
    }, 0);
    const precioUSD = total.toFixed(2);
    const collect = {
        body: {
            intent: "CAPTURE",
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
        prefer: "return=representation",
    };
    try {
        console.log("🛒 Payload enviado a PayPal:", JSON.stringify(collect, null, 2));
        const _a = yield ordersController.createOrder(collect), { body } = _a, httpResponse = __rest(_a, ["body"]);
        let parsedBody;
        if (typeof body === "string") {
            parsedBody = JSON.parse(body);
        }
        else if (Buffer.isBuffer(body)) {
            parsedBody = JSON.parse(body.toString("utf-8"));
        }
        else if (typeof body === "object") {
            parsedBody = body;
        }
        else {
            throw new Error("Unexpected body type in response");
        }
        return {
            jsonResponse: parsedBody,
            httpStatusCode: httpResponse.statusCode,
        };
    }
    catch (error) {
        console.error("❌ Error al crear orden PayPal:");
        console.error(error);
        if (error instanceof paypal_server_sdk_1.ApiError) {
            console.error("🛑 ApiError:", error.message);
            console.error("🧾 Detalle:", JSON.stringify(error, null, 2));
            throw new Error(error.message);
        }
        if (error.response) {
            console.error("📨 Error response data:", error.response.data);
        }
        throw new Error("Fallo inesperado al crear orden.");
    }
});
const captureOrder = (orderID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = yield ordersController.captureOrder({
            id: orderID,
        }), { body } = _a, httpResponse = __rest(_a, ["body"]);
        let parsedBody;
        if (typeof body === "string") {
            parsedBody = JSON.parse(body);
        }
        else if (Buffer.isBuffer(body)) {
            parsedBody = JSON.parse(body.toString("utf-8"));
        }
        else if (typeof body === "object") {
            parsedBody = body;
        }
        else {
            throw new Error("Unexpected body type in response");
        }
        return {
            jsonResponse: parsedBody,
            httpStatusCode: httpResponse.statusCode,
        };
    }
    catch (error) {
        console.error("Error en captura PayPal:", error);
        if (error instanceof paypal_server_sdk_1.ApiError) {
            console.error("Detalle PayPal:", error.message, error);
        }
        throw new Error("Failed to capture order.");
    }
});
paypalRouter.post("/orders", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "Missing userId in request Body" });
        }
        const carrito = yield prisma.cARRITO.findUnique({
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
        const items = carrito.items.map((item) => {
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
        const cart = { items };
        const { jsonResponse, httpStatusCode } = yield createOrder(cart);
        return res.status(httpStatusCode).json(jsonResponse);
    }
    catch (error) {
        console.error("Failed to create order:", error);
        if (error.stack) {
            console.error(error.stack);
        }
        return res.status(500).json({
            error: "Failed to create order.",
            details: error.message || error.toString(),
        });
    }
}));
paypalRouter.post("/orders/:orderID/capture", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const { userId } = req.body;
        if (!userId) {
            return res
                .status(400)
                .json({ error: "Missing userId in request body" });
        }
        const { orderID } = req.params;
        const { jsonResponse, httpStatusCode } = yield captureOrder(orderID);
        const purchaseUnits = jsonResponse.purchase_units || [];
        const payer = jsonResponse.payer || {};
        const paymentStatus = jsonResponse.status;
        const orden = yield prisma.oRDENES.create({
            data: {
                orderId: orderID,
                usuario_fk: userId,
                estado: paymentStatus,
                payerEmail: payer.email_address || null,
                payerName: payer.name
                    ? `${payer.name.given_name} ${payer.name.surname}`
                    : null,
                total: purchaseUnits.length > 0
                    ? parseFloat(purchaseUnits[0].payments.captures[0].amount.value)
                    : 0,
                moneda: purchaseUnits.length > 0
                    ? purchaseUnits[0].payments.captures[0].amount.currency_code
                    : null,
            },
        });
        const carrito = yield prisma.cARRITO.findUnique({
            where: { usuario_fk: userId },
            include: {
                items: {
                    include: {
                        producto: true,
                    },
                },
            },
        });
        if (!(carrito === null || carrito === void 0 ? void 0 : carrito.items) || carrito.items.length === 0) {
            throw new Error("El carrito no tiene ítems cargados");
        }
        const ordenItemsData = [];
        for (const item of carrito.items) {
            const precioCordobas = item.producto.precioVenta.toNumber();
            const tipoCambio = 36.84;
            const precioUSD = parseFloat((precioCordobas / tipoCambio).toFixed(2));
            const subtotalUSD = parseFloat(((precioCordobas * item.cantidad) / tipoCambio).toFixed(2));
            const ordenItem = yield prisma.oRDEN_ITEM.create({
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
        const count = yield prisma.factura.count({
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
        const shippingAddress = ((_b = (_a = purchaseUnits[0]) === null || _a === void 0 ? void 0 : _a.shipping) === null || _b === void 0 ? void 0 : _b.address) || {}; // Puede no venir, así que manejar caso null
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
        const metodoPago = ((_c = jsonResponse.payment_source) === null || _c === void 0 ? void 0 : _c.card)
            ? "Tarjeta"
            : ((_d = jsonResponse.payment_source) === null || _d === void 0 ? void 0 : _d.paypal)
                ? "PayPal"
                : "Desconocido";
        const telefono = ((_f = (_e = payer.phone) === null || _e === void 0 ? void 0 : _e.phone_number) === null || _f === void 0 ? void 0 : _f.national_number) || null;
        const persona = yield prisma.pERSONA.findUnique({
            where: { usuario_fk: userId },
        });
        const nombreCliente = persona
            ? `${persona.nombres} ${persona.apellidos}`
            : "Cliente";
        const factura = yield prisma.factura.create({
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
            yield prisma.facturaItem.create({
                data: {
                    factura_id: factura.factura_pk,
                    orden_item_id: ordenItem.orden_item_pk,
                },
            });
        }
        for (const item of carrito.items) {
            if (item.talla_fk) {
                yield prisma.tALLA.update({
                    where: { talla_pk: item.talla_fk },
                    data: {
                        cantidad: { decrement: item.cantidad },
                    },
                });
                // Verificar si todas las tallas del producto están en 0
                const tallasProducto = yield prisma.tALLA.findMany({
                    where: { producto_fk: item.producto_fk },
                });
                const todasAgotadas = tallasProducto.every((t) => t.cantidad === 0);
                if (tallasProducto.length > 0 && todasAgotadas) {
                    yield prisma.pRODUCTOS.update({
                        where: { producto_pk: item.producto_fk },
                        data: { estado: "Agotado" },
                    });
                }
            }
        }
        if (carrito) {
            yield prisma.cARRITO_ITEM.deleteMany({
                where: {
                    carrito_fk: carrito.carrito_pk,
                },
            });
            yield prisma.cARRITO.update({
                where: { carrito_pk: carrito.carrito_pk },
                data: { total: 0 },
            });
        }
        return res.status(httpStatusCode).json(jsonResponse);
    }
    catch (error) {
        console.error("Failed to capture order:", error);
        return res.status(500).json({ error: "Failed to capture order." });
    }
}));
exports.default = paypalRouter;
