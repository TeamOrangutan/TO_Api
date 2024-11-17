import { Request, Response } from "express";
import { prismaclient } from "../..";
import { compareSync, hashSync } from "bcrypt";
import { userI } from "../../@types";
import * as jwt from "jsonwebtoken";
import { JWT_ROUND, JWT_SECRET } from "../../config";

export const signup = async (req: Request, res: Response) => {
  const { correo, contrasena }: userI = req.body;

  let Usuario = await prismaclient.usuario.findFirst({ where: { correo } });
  if (Usuario) {
    throw Error("Usuario already exists");
  }
  Usuario = await prismaclient.usuario.create({
    data: {
      correo: correo,
      contrasena: hashSync(contrasena, JWT_ROUND),
      nombre: "Kaiz",
      rol_fk: 1,
    },
  });
  res.json({ data: Usuario });
};

export const Login = async (req: Request, res: Response) => {
  const { correo, contrasena } = req.body;

  const user = await prismaclient.usuario.findFirst({ where: { correo } });
  if (!user) {
    throw Error("User was not found");
  }
  if (compareSync(contrasena, user.contrasena)) {
    const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ message: "Login successful", token });
  }
  return res.status(401).json({ message: "Invalid credentials" });
};
