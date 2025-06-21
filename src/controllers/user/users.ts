import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

export const prisma = new PrismaClient();

export const getAllUsers = async (__req: Request, res: Response) => {
  try {
    const usuarios = await prisma.pERSONA.findMany({
      include: {
        usuario: {
          include: {
            rol: {
              select: {
                descripcion: true,
              },
            },
            ordenes: true,
          },
        },
      },
    });

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ error: "No se encontraron usuarios" });
    }

    const usuariosResumen = usuarios.map((u) => {
      const { usuario, ...personaData } = u;
      if (!usuario)
        return {
          ...personaData,
          cantidadOrdenes: 0,
          montoTotalOrdenes: 0,
          rol: null,
          estado: null,
        };

      const ordenes = usuario.ordenes || [];
      const cantidadOrdenes = ordenes.length;
      const montoTotalOrdenes = ordenes.reduce(
        (sum, orden) => sum + (orden.total || 0),
        0
      );

      return {
        ...personaData,
        rol: usuario.rol?.descripcion || null,
        estado: usuario.estado || null,
        correo: usuario.correo || null,
        telefono: usuario.telefono || null,
        ultimoAcceso: usuario.ultimoAcceso || null,
        cantidadOrdenes,
        montoTotalOrdenes,
      };
    });

    return res.status(200).json({ usuarios: usuariosResumen });
  } catch (error) {
    return res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

export const updateStateUser = async (req: Request, res: Response) => {
  const { estado, usuario_pk } = req.body;

  if (!estado && !usuario_pk) {
    return res.status(400).json({
      error: "Estado y usuario_pk son requeridos",
    });
  }

console.log(estado)

   try {
    const user = await prisma.uSUARIO.update({
      where: {
        usuario_pk: Number(usuario_pk),
      },
      data: {
        estado: estado,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    console.log(user)
    return res.status(200).json({
      message: "Estado actualizado correctamente",
      user: user,
    });
  } catch (error) {
    return res.status(500).json({ error: "Error al actualizar estado del usuario" });
  }
};
