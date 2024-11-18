import { NextFunction, Request, Response } from "express";
import { prismaclient } from "../..";
import { compareSync, hashSync } from "bcrypt";
import { userI } from "../../types";
import * as jwt from "jsonwebtoken";
import { JWT_ROUND, JWT_SECRET } from "../../config";
import { BadRequestsException } from "../../exceptions/bad-requests";
import { ErrorCode } from "../../exceptions/root";
import { SignupSchema } from "../../schema";
import { NotFoundException } from "../../exceptions/not-found";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  SignupSchema.parse(req.body);
  const { correo, contrasena, nombre }: userI = req.body;
  var { rol_fk }: userI = req.body;

  let Usuario = await prismaclient.usuario.findFirst({ where: { correo } });
  if (Usuario) {
    next(
      new BadRequestsException(
        "User already exists!",
        ErrorCode.USER_ALREADY_EXISTS
      )
    );
  }
  Usuario = await prismaclient.usuario.create({
    data: {
      correo: correo,
      contrasena: hashSync(contrasena, JWT_ROUND),
      nombre: nombre,
      rol_fk: !rol_fk ? 2: rol_fk,
    },
  });
  res.json({ data: Usuario });
};

export const Login = async (req: Request, res: Response) => {
  const { correo, contrasena } = req.body;

  let user = await prismaclient.usuario.findFirst({ where: { correo } });
  if (!user) {
    throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
  }
  if (!compareSync(contrasena, user.contrasena)) {
    throw new BadRequestsException(
      "Incorrect password",
      ErrorCode.INCORRECT_PASSWORD
    );
  }
  const token = jwt.sign(
    {
      user_pk: user.user_pk,
    },
    JWT_SECRET
  );

  res.json({ user, token });
  /* return res.status(401).json({ message: "Invalid credentials" }); */
};

/* me */
export const me = async (req: Request, res: Response) => {
  res.json(req.usuario);
};
