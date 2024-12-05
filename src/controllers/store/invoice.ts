import { Request, Response } from "express";
import { prismaclient } from "../../index";
import Decimal from "decimal.js";

interface invoiceProps {
  productos: {
    producto_pk: number;
    cantidad: number;
  }[];
}

export const createInvoice = async (req: Request, res: Response) => {
  const { productos }: invoiceProps = req.body;

  const productoPKs = productos.map((producto) => producto.producto_pk);

  const newFactura = await prismaclient.fACTURA.create({
    data: {
      total: 0.0,
    },
  });

  const data = await prismaclient.pRODUCTOS.findMany({
    where: {
      producto_pk: {
        in: productoPKs,
      },
    },
    select: {
      precioVenta: true,
      producto_pk: true,
    },
  });
  const productoPrice = data.reduce((acc, producto) => {
    acc[producto.producto_pk] = Number(producto.precioVenta);
    return acc;
  }, {} as Record<number, number>);

  const total = productos.reduce((accumulator, producto) => {
    const precioVenta = productoPrice[producto.producto_pk];
    return accumulator + precioVenta * producto.cantidad;
  }, 0);

  const producto = productos.map((producto) => ({
    cantidad: producto.cantidad,
    producto_fk: producto.producto_pk,
    factura_fk: newFactura.factura_pk,
    subTotal: productoPrice[producto.producto_pk] * producto.cantidad,
  }));

  await prismaclient.fAC_PRODUCTO.createMany({
    data: producto,
  });

  const fecha = new Date();

  const Bill = await prismaclient.fACTURA.update({
    where: {
      factura_pk: newFactura.factura_pk,
    },
    data: {
      total: total,
      fecha: fecha.toISOString(),
    },
  });
  res.send(Bill);
};

export const getInvoices = async (_req: Request, res: Response) => {
  const data = await prismaclient.fACTURA.findMany({
    select: {
      factura_pk: true,
      fecha: true,
      total: true,
      formaPago: {
        select: {
          fPagoClientes: {
            select: {
              formaPago: {
                select: {
                  servicio: {
                    select: {
                      nombre: true,
                    },
                  },
                },
              },
              cliente: {
                select: {
                  nombres: true,
                  usuario: {
                    select: {
                      correo: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const formatData = data.map((data) => ({
    factura_pk: data.factura_pk,
    date: data.fecha?.toLocaleDateString(),
    hour: data.fecha?.toLocaleTimeString(),
    total: data.total,
    paymentMethod: data.formaPago?.fPagoClientes.map((fpago) => {
      fpago.formaPago.servicio.nombre;
    })
      ? data.formaPago?.fPagoClientes.map((fpago) => {
          fpago.formaPago.servicio.nombre;
        })
      : "Efectivo",
    email: data.formaPago?.fPagoClientes.map(
      (fpago) => fpago.cliente.usuario.correo
    )
      ? data.formaPago?.fPagoClientes.map(
          (fpago) => fpago.cliente.usuario.correo
        )
      : "Test@gmail.com",
    name: data.formaPago?.fPagoClientes.map((fpago) => fpago.cliente.nombres)
      ? data.formaPago?.fPagoClientes.map((fpago) => fpago.cliente.nombres)
      : "Usuario Defecto",
  }));

  res.json(formatData);
};
export const getSales = async (_req: Request, res: Response) => {
  try {
    const fhoy = new Date();

    const comienzoMes = new Date(fhoy.getFullYear(), fhoy.getMonth(), 1);
    const comienzoMesAnterior = new Date(
      fhoy.getFullYear(),
      fhoy.getMonth() - 1,
      1
    );

    const sem = new Date(fhoy);
    sem.setDate(fhoy.getDate() - fhoy.getDay());

    const vhoy = new Date(fhoy.setHours(0, 0, 0, 0));

    const totalVentas = await prismaclient.fACTURA.aggregate({
      _sum: {
        total: true,
      },
    });

    const vMensuales = await prismaclient.fACTURA.aggregate({
      _sum: {
        total: true,
      },
      where: {
        fecha: {
          gte: comienzoMes,
        },
      },
    });

    const vMensualesAnterior = await prismaclient.fACTURA.aggregate({
      _sum: {
        total: true,
      },
      where: {
        fecha: {
          gte: comienzoMesAnterior,
          lt: comienzoMes,
        },
      },
    });

    const vSem = await prismaclient.fACTURA.aggregate({
      _sum: {
        total: true,
      },
      where: {
        fecha: {
          gte: sem,
        },
      },
    });

    const vHoy = await prismaclient.fACTURA.aggregate({
      _sum: {
        total: true,
      },
      where: {
        fecha: {
          gte: vhoy,
        },
      },
    });

    // paraconvertir Decimal a number o 0 si es null
    const toNumber = (value: Decimal | null): number => {
      return value ? parseFloat(value.toString()) : 0;
    };

    // diferencia margen de ganancia/prdida
    const diferenciaMes =
      toNumber(vMensuales._sum.total) - toNumber(vMensualesAnterior._sum.total);

    const porcentajeDiferencia =
      toNumber(vMensualesAnterior._sum.total) !== 0
        ? (diferenciaMes / toNumber(vMensualesAnterior._sum.total)) * 100
        : 0;

    res.json({
      ventasTotales: totalVentas._sum.total
        ? totalVentas._sum.total
        : "00,000.00",
      ventasMensuales: vMensuales._sum.total
        ? vMensuales._sum.total
        : "00,000.00",
      ventasMesAnterior: vMensualesAnterior._sum.total
        ? vMensualesAnterior._sum.total
        : "00,000.00",
      porcentajeDiferencia: `${porcentajeDiferencia.toFixed(2)}%`,
      ventasSemana: vSem._sum.total ? vSem._sum.total : "00,000.00",
      ventasHoy: vHoy._sum.total ? vHoy._sum.total : "00,000.00",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las ventas." });
  }
};

export const getInvoiceDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(id);

  const data = await prismaclient.fAC_PRODUCTO.findMany({
    select: {
      cantidad: true,
      subTotal: true,
      factura: {
        select: {
          total: true,
        },
      },
      producto: {
        select: {
          precioVenta: true,
          nombre: true,
        },
      },
    },
    where: {
      factura_fk: Number(id),
    },
  });

  const parseData = data.map((data) => ({
    name: data.producto.nombre,
    price: Number(data.producto.precioVenta),
    quantity: data.cantidad,
    subtotal: data.subTotal,
  }));
  res.send(parseData);
};
