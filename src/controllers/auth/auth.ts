import { NextFunction, Request, Response } from "express";
import { prismaclient } from "../..";
import { compareSync, hashSync } from "bcrypt";
import { userI } from "../../@types";
import * as jwt from "jsonwebtoken";
import { JWT_ROUND, JWT_SECRET } from "../../config";
import { BadRequestsException } from "../../exceptions/bad-requests";
import { ErrorCode } from "../../exceptions/root";
/* import { UnprocessableEntity } from "../../exceptions/validation"; */
import { SignupSchema } from "../../schema";
import { NotFoundException } from "../../exceptions/not-found";

export const signup = async (req: Request, res: Response, next: NextFunction) => {  
  SignupSchema.parse(req.body)
    const { correo, contrasena }: userI = req.body;
  
  let Usuario = await prismaclient.usuario.findFirst({ where: { correo } });  
  if (Usuario) {
    next(new BadRequestsException('User already exists!', ErrorCode.USER_ALREADY_EXISTS));
  }
  Usuario = await prismaclient.usuario.create({
    data: {
      correo: correo,
      contrasena: hashSync(contrasena, JWT_ROUND),
      nombre: "Kaiz",
      rol_fk: 1
    },
  });
  res.json({ data: Usuario }); 
};

export const Login = async (req: Request, res: Response) => {
  const { correo, contrasena } = req.body;

  let user = await prismaclient.usuario.findFirst({ where: { correo } });
  if (!user) {
    throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND)
    /* throw Error("User was not found"); */
  }
  if (compareSync(contrasena, user.contrasena)) {
    const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ message: "Login successful", token });
  }
  return res.status(401).json({ message: "Invalid credentials" });
};
