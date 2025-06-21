import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const cliente = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req: Request, res: Response): Promise<Response> => {
  const { token } = req.body;

  try {
    const ticket = await cliente.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: "Token inválido" });
    }

    const { email, given_name, family_name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: "No se recibió un email válido desde Google" });
    }

    let user = await prisma.uSUARIO.findUnique({
      where: { correo: email },
      include: {rol: true},
    });

    if(user?.estado == "Inactivo"){
       return res.status(401).json({ error: "Usuario no encontrado" });
    }
    if (!user) {
      const defaultRole = await prisma.rOL.findFirst({
        where: { descripcion: "User" },
      });

      if (!defaultRole) {
        return res.status(401).json({ error: "Rol por defecto no encontrado" });
      }
      

      user = await prisma.uSUARIO.create({
        data: {
          estado: "Activo",
          correo: email,
          contrasena: "google_oauth_default_password",
          rol_fk: defaultRole.rol_pk,
        },
      include: { rol: true },
      });

      await prisma.pERSONA.create({
        data: {
          nombres: given_name || "Nombre",
          apellidos: family_name || "Apellido",
          direccion: "",
          usuario_fk: user.usuario_pk,
          imagenPerfil: picture || undefined,
        },
      });
    }

    // 🔄 Buscar o crear carrito
    let carrito = await prisma.cARRITO.findUnique({
      where: {
        usuario_fk: user.usuario_pk,
      },
    });

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

    // 🔐 Generar token
    const jwtToken = jwt.sign(
      {
        userId: user.usuario_pk,
        passwordChangedAt: user.passwordChangedAt?.getTime() || 0,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );


    await prisma.uSUARIO.update({
      where: { usuario_pk: user.usuario_pk },
      data: { ultimoAcceso: new Date() },
    });

    return res.status(200).json({
      message: "Autenticación exitosa",
      token: jwtToken,
      userId: user.usuario_pk,
      carritoId: carrito.carrito_pk,
      rol: user.rol.rol_pk,
    });

  } catch (err) {
    console.error("Error en login con Google:", err);
    return res.status(401).json({ error: "Error de autenticación con Google" });
  }
};
