import { Request, Response } from "express";
import { prismaclient } from "../../index";
import Decimal from "decimal.js";

interface invoiceProps {
  nombreCliente: string
  productos: [
    {
      producto_pk: number;
      cantidad: number;
    }
  ];
  formaPago_fk: number;
}

export const createInvoice = async (req: Request, res: Response) => {
  const { productos, nombreCliente }: invoiceProps = req.body;
  console.log(productos);
  console.log('REQ.BODY:', req.body);

  const productoPKs = productos.map((producto) => producto.producto_pk);

  const newFactura = await prismaclient.fACTURA.create({
    data: {
      nombreCliente: nombreCliente,
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

export const getInvoiceProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const productos = await prismaclient.fAC_PRODUCTO.findMany({
      where: {
        factura_fk: Number(id),
      },
      select: {
        cantidad: true,
        producto: {
          select: {
            nombre: true,
            precioVenta: true,
          },
        },
      },
    });

    res.json(productos);  // Asegúrate de retornar la respuesta correctamente
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos de la factura." });
  }
};

export const getSales = async (_req: Request, res: Response) => {
  try {
    const fhoy = new Date();

    const comienzoMes = new Date(fhoy.getFullYear(), fhoy.getMonth(), 1);    
    const comienzoMesAnterior = new Date(fhoy.getFullYear(), fhoy.getMonth() - 1, 1);
    
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
    const diferenciaMes = toNumber(vMensuales._sum.total) - toNumber(vMensualesAnterior._sum.total);

    const porcentajeDiferencia = toNumber(vMensualesAnterior._sum.total) !== 0
      ? (diferenciaMes / toNumber(vMensualesAnterior._sum.total)) * 100 : 0; 

    res.json({
      ventasTotales: totalVentas._sum.total ? totalVentas._sum.total : '00,000.00',
      ventasMensuales: vMensuales._sum.total ? vMensuales._sum.total : '00,000.00',
      ventasMesAnterior: vMensualesAnterior._sum.total ? vMensualesAnterior._sum.total : '00,000.00',      
      porcentajeDiferencia: `${porcentajeDiferencia.toFixed(2)}%`,
      ventasSemana: vSem._sum.total ? vSem._sum.total : '00,000.00',
      ventasHoy: vHoy._sum.total ? vHoy._sum.total : '00,000.00',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las ventas." });
  }
};


export const getAllInvoices = async (_: any, res: Response): Promise<void> => {
  try {
    // Obtenemos todas las facturas junto con sus productos relacionados
    const facturas = await prismaclient.fACTURA.findMany({
      include: {
        formaPago: true,  // Incluye la relación con la forma de pago
        facProductos: {
          include: {
            producto: true,  // Incluye los productos asociados a la factura
          },
        },
      },
    });

    // Respondemos con las facturas obtenidas
    res.json(facturas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las facturas.' });
  }
};