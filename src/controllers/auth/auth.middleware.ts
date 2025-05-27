import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const jwtSecret = process.env.JWT_SECRET!;

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2. Decodificar el token
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: number;
      passwordChangedAt: number;
      iat: number;
    };

    // 3. Buscar al usuario
    const user = await prisma.uSUARIO.findUnique({
      where: { usuario_pk: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }
    const passwordChangedAt = user.passwordChangedAt?.getTime() || 0;
    if (passwordChangedAt > decoded.iat * 1000) {
      return res
        .status(401)
        .json({ message: "Contraseña cambiada. Vuelve a iniciar sesión." });
    }

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
