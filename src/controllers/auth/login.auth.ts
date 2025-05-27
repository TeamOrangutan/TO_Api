import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { sendResetPasswordEmail } from "../../services/mailService";
const prisma = new PrismaClient();
import crypto from "crypto";
// Función de login
export const login = async (req: Request, res: Response): Promise<Response> => {
  const { correo, contrasena } = req.body;

  // Validación de campos requeridos
  if (!correo || !contrasena) {
    return res
      .status(400)
      .json({ error: "Correo y contraseña son requeridos" });
  }

  // Validar formato de correo (opcional, pero recomendado)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    return res
      .status(400)
      .json({ error: "El correo proporcionado no es válido" });
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
      return res
        .status(500)
        .json({ error: "Clave secreta para JWT no configurada" });
    }

    let carrito = await prisma.cARRITO.findUnique({
      where: {
        usuario_fk: user.usuario_pk,
      },
    });


    console.log(carrito);
    

    if (!carrito) {
      carrito = await prisma.cARRITO.create({
        data: {
          usuario: {
            connect: { usuario_pk: user.usuario_pk },
          },
          total: 0,
        },
      });
    }

    // Generar el token JWT
    const token = jwt.sign(
      {
        userId: user.usuario_pk,
        passwordChangedAt: user.passwordChangedAt?.getTime() || 0,
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    // Responder con el token JWT
    return res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      userId: user.usuario_pk,
      carritoId: carrito.carrito_pk,
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ error: "Error interno al iniciar sesión" });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { correo } = req.body;

  console.log(correo);

  try {
    const user = await prisma.uSUARIO.findUnique({ where: { correo } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hora

    await prisma.uSUARIO.update({
      where: { usuario_pk: user.usuario_pk },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    await sendResetPasswordEmail(correo, token);

    return res
      .status(200)
      .json({ message: "Correo enviado con instrucciones." });
  } catch (err) {
    return res.status(500).json({ message: "Error enviando el correo." });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  console.log(token);
  console.log(newPassword);

  try {
    const user = await prisma.uSUARIO.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.uSUARIO.update({
      where: { usuario_pk: user.usuario_pk },
      data: {
        contrasena: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        passwordChangedAt: new Date(),
      },
    });

    return res
      .status(200)
      .json({ message: "Contraseña actualizada correctamente." });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error actualizando la contraseña." });
  }
};
