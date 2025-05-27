import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const userProfile = async (req: Request, res: Response) => {
  const { usuarioId } = req.params;

    console.log(usuarioId);
    

  if (!usuarioId) {
    res
      .status(400)
      .json({ error: "Faltan datos necesarios o userId inválido" });
    return;
  }

  try {
    const usuario = await prisma.uSUARIO.findUnique({
      where: {
        usuario_pk: Number(usuarioId),
      },
      select: {
        usuario_pk: true,
        correo: true,
        rol: {
          select: {
            descripcion: true,
          },
        },
        persona: {
          select: {
            nombres: true,
            apellidos: true,
            direccion: true,
            imagenPerfil: true
          },
        },
      },
    });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json(usuario);
  } catch (error) {
   console.error("Error al obtener el usuario:", error);
    return res.status(500).json({ message: "Error del servidor" });

  }
};


export const updateUserData = async (req: Request, res: Response) => {
  const { usuarioId } = req.params;
  const { nombres, apellidos, direccion, correo } = req.body;

  const imagenPerfil = req.file ? `uploads/user/${req.file.filename}` : undefined;

  try {
    // Verificar si el correo ya está en uso por otro usuario (excepto el actual)
    const existingUser = await prisma.uSUARIO.findFirst({
      where: {
        correo,
        NOT: { usuario_pk: Number(usuarioId) },
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Este correo ya está en uso por otro usuario." });
    }

    // Actualiza datos de persona
    const updatedPersona = await prisma.pERSONA.update({
      where: { usuario_fk: Number(usuarioId) },
      data: {
        nombres,
        apellidos,
        direccion,
        ...(imagenPerfil && { imagenPerfil }),
      },
    });

    // Actualiza el correo en USUARIO
    const updatedUsuario = await prisma.uSUARIO.update({
      where: { usuario_pk: Number(usuarioId) },
      data: { correo },
    });

    return res.status(200).json({
      message: "Usuario actualizado correctamente",
      persona: updatedPersona,
      usuario: updatedUsuario,
    });
  } catch (error) {
    console.error("Error actualizando datos:", error);
    return res.status(500).json({ error: "Error al actualizar los datos del usuario" });
  }
};
