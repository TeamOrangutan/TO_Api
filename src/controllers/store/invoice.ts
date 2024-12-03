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
  const { productos, formaPago_fk}: invoiceProps = req.body;
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
    subTotal: 0
  }));

  await prismaclient.fAC_PRODUCTO.createMany({
    data: producto
  
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
      facProductos: {
        select: {
          facProducto_pk: true
        }
      },
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


export const getInvoiceDetails = async ( req: Request ,  res: Response) => {
  const {id} = req.params;

  const data = prismaclient.fAC_PRODUCTO.findMany({
    select: {
      cantidad: true, 
      factura: {
        select: {
          total: true, 
        }
      }, 
      producto: {
        select: {
          precioVenta: true, 
          nombre: true,
        }
      }
    }, 
    where: {
      facProducto_pk: Number(id)
    }
  })
  res.json(data);
};