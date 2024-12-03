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
      ventasTotales: totalVentas._sum.total,   
      ventasMensuales: vMensuales._sum.total,
      ventasSemana: vSem._sum.total,
      ventasHoy: vHoy._sum.total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las ventas." });
  }
};
