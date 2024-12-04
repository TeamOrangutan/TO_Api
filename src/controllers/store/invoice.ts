import { Request, Response } from "express";
import { prismaclient } from "../../index";

interface invoiceProps {
  productos: [
    {
      producto_pk: number;
      cantidad: number;
    }
  ];
  formaPago_fk: number;
}

export const createInvoice = async (req: Request, res: Response) => {
  const { productos, formaPago_fk }: invoiceProps = req.body;
  const productoPKs = productos.map((producto) => producto.producto_pk);

  const newFactura = await prismaclient.fACTURA.create({
    data: {
      total: 0.0,
      formaPago_fk: formaPago_fk! ? null : formaPago_fk,
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
    },
  });
  const productoPrice = data.map((data) => Number(data.precioVenta));

  const total = productoPrice.reduce(
    (accumulator, currentValue, index) =>
      accumulator +
      currentValue * productos[productos.length - (index + 1)].cantidad,
    0
  );

  const producto = productos.map((producto) => ({
    cantidad: producto.cantidad,
    producto_fk: producto.producto_pk,
    factura_fk: newFactura.factura_pk,
    subTotal: 0,
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

  const fecha = new  Date()
  const formatData = data.map((data) => ({
    date: fecha.toLocaleDateString() ,
    hour: fecha.toLocaleTimeString(),
    total: data.total,
    paymentMethod: data.formaPago?.fPagoClientes.map((fpago) => {
      fpago.formaPago.servicio.nombre;
    }) ? data.formaPago?.fPagoClientes.map((fpago) => {
      fpago.formaPago.servicio.nombre;
    }): 'Efectivo',
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
    res.json({
      ventasTotales: totalVentas._sum.total ? totalVentas._sum.total : '00,000.00',
      ventasMensuales: vMensuales._sum.total ? vMensuales._sum.total : '00,000.00',
      ventasSemana: vSem._sum.total ? vSem._sum.total : '00,000.00',
      ventasHoy: vHoy._sum.total ? vHoy._sum.total : '00,000.00',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las ventas." });
  }
};
