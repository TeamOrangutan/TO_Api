import { Request, Response } from "express";
import { prisma } from "../../prisma";

export const createInvoice = async (req: Request, res: Response) => {
  const { formaPago_fk, productos } = req.body; 

  try {    
    const total = productos.reduce((acumulado: number, producto: { cantidad: number }) => {
      return acumulado + producto.cantidad;
    }, 0);
    
    const invoice = await prisma.fACTURA.create({
      data: {
        formaPago_fk: formaPago_fk || null, 
        total, 
        fecha: new Date().toISOString(),
        facProductos: {
          create: productos.map((producto: { producto_fk: number; cantidad: number }) => ({
            producto_fk: producto.producto_fk,
            cantidad: producto.cantidad,
          })),
        },
      },
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error("Error creando la factura:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};






