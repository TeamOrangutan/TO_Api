import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Función de login
export const login = async (req: Request, res: Response): Promise<Response> => {
  const { correo, contrasena } = req.body;

  // Validación de campos requeridos
  if (!correo || !contrasena) {
    return res.status(400).json({ error: "Correo y contraseña son requeridos" });
  }

  // Validar formato de correo (opcional, pero recomendado)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    return res.status(400).json({ error: "El correo proporcionado no es válido" });
  }

  try {
    // Buscar al usuario por correo
    const user = await prisma.uSUARIO.findUnique({
      where: { correo },
    });

    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    // Comparar las contraseñas
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    // Verificar la clave secreta para el JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: "Clave secreta para JWT no configurada" });
    }

    // Generar el token JWT
    const token = jwt.sign({ userId: user.usuario_pk }, jwtSecret, { expiresIn: "1h" });

    // Responder con el token JWT
    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ error: "Error interno al iniciar sesión" });
  }
};
