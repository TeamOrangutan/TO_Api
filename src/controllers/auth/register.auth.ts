import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export const register = async (req: Request, res: Response): Promise<Response> => {
    const { correo, contrasena, nombres, apellidos, direccion, rol_fk } = req.body;
  
    // Validación
    if (!correo || !contrasena || !nombres || !apellidos || !direccion || !rol_fk) {
      console.log(correo);
      
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }
  
    try {
      // Verificar si el usuario ya existe
      const existingUser = await prisma.uSUARIO.findUnique({
        where: { correo },
      });
  
      if (existingUser) {
        return res.status(400).json({ error: "El correo ya está registrado" });
      }
  
      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(contrasena, 10);
  
      // Crear usuario Y persona en una transacción
      const result = await prisma.$transaction(async (prisma) => {
        const newUser = await prisma.uSUARIO.create({
          data: {
            correo,
            contrasena: hashedPassword,
            rol_fk,
          },
        });
  
        const newPersona = await prisma.pERSONA.create({
          data: {
            nombres,
            apellidos,
            direccion,
            usuario_fk: newUser.usuario_pk,
          },
        });
  
        return { newUser, newPersona };
      });
  
      // Generar JWT
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({ error: "Clave secreta para JWT no configurada" });
      }
  
      const token = jwt.sign({ userId: result.newUser.usuario_pk }, jwtSecret, { expiresIn: "1h" });
  
      return res.status(201).json({
        message: "Registro exitoso",
        token,
        user: {
          id: result.newUser.usuario_pk,
          email: result.newUser.correo,
          persona: {
            nombres: result.newPersona.nombres,
            apellidos: result.newPersona.apellidos
          }
        }
      });
  
    } catch (error) {
      console.error("Error en registro:", error);
      return res.status(500).json({ error: "Error interno al registrar" });
    }
  };