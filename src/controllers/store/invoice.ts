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
