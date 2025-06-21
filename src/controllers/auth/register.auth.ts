import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const { nombres, apellidos, correo, direccion, contrasena } = req.body;

  if (!nombres || !apellidos || !correo || !direccion || !contrasena) {
    return res.status(400).json({ error: "Todos los campos son requeridos." });
  }

  try {
    const existeUsuario = await prisma.uSUARIO.findUnique({
      where: { correo },
    });

    if (existeUsuario) {
      return res.status(409).json({ error: "Este correo ya está registrado." });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = await prisma.uSUARIO.create({
      data: {
        estado: "Activo", 
        correo,
        contrasena: hashedPassword,
        rol_fk: 2, // Cambia según tu lógica
        persona: {
          create: {
            nombres,
            apellidos,
            direccion,
          },
        },
      },
      include: {
        persona: true,
      },
    });

    return res
      .status(201)
      .json({ message: "Usuario creado correctamente", usuario: nuevoUsuario });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
