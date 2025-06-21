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
        createdAt: "desc",
      },
      include: {
        usuario: {
          select: {
            persona: {
              select: {
                nombres: true,
                apellidos: true,
              },
            },
          },
        },
        ordenItem: {
          include: {
            producto: true,
            talla: true,
          },
        },
        factura: {
          select: {
            factura_pk: true,
          },
        },
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

export const getResumenOrdenes = async (__req: Request, res: Response) => {
  try {
    const ordenes = await prisma.oRDENES.findMany({
      include: {
        factura: true,
        usuario: {
          select: {
            persona: {
              select: {
                nombres: true,
                apellidos: true,
              },
            },
          },
        },
        ordenItem: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const resumen = ordenes.map((orden) => {
      const productosNombres = orden.ordenItem
        .map((item) => item.producto.nombre)
        .join(", ");
      const cantidadTotal = orden.ordenItem.reduce(
        (sum, item) => sum + item.cantidad,
        0
      );

      return {

        factura: orden.factura?.factura_pk,
        codigo: orden.orderId,
        cliente: orden.usuario.persona?.nombres + " " + orden.usuario.persona?.apellidos || "Desconocido",
        productos: productosNombres,
        cantidad: cantidadTotal,
        estado: orden.estado,
        monto: `${orden.total.toFixed(2)} ${orden.moneda || "C$"}`,
        fecha: orden.createdAt,
      };
    });

    res.json({ data: resumen });
  } catch (error) {
    console.error("Error al obtener resumen de órdenes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
