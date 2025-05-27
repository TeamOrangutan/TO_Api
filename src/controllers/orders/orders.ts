import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { usuarioId } = req.params;

  if (!usuarioId || isNaN(Number(usuarioId))) {
    res
      .status(400)
      .json({ error: "Faltan datos necesarios o usuarioId no válido" });
    return;
  }

  try {
    const ordenes = await prisma.oRDENES.findMany({
      where: {
        usuario_fk: Number(usuarioId),
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        ordenItem: {
          include: {
            producto: true,
            talla: true,
          },
        },
        factura: {
            select: {
                factura_pk: true
            }
        }
      },
    });

    if (!ordenes) {
      res.status(404).json({ error: "Ordenes no encontradas" });
      return;
    }

    res.json({
      ordenes,
    });
  } catch (error) {
    res.status(500).json({ error: "Error interno al obtener las ordenes" });
  }
};
