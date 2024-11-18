import { NextFunction, Request, Response } from "express";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config";
import { prismaclient } from "..";

const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
    try {      
      const authHeader = req.headers.authorization;
  
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("Token no encontrado o formato inválido");
        return next(new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
      }
  
      const token = authHeader.split(" ")[1];
  
      console.log("Token recibido:", token);
      
      const payload = jwt.verify(token, JWT_SECRET) as { user_pk: number };
      console.log("Payload del token:", payload);
        
      const user = await prismaclient.usuario.findFirst({
        where: { user_pk: payload.user_pk },
      });
  
      if (!user) {
        console.log("Usuario no encontrado en la base de datos");
        return next(new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
      }
  
      console.log("Usuario autenticado:", user);
        
      req.usuario = user as any;
      next();
    } catch (error) {
      console.log("Error en la autenticación:", error);
      next(new UnauthorizedException("Unauthorized", ErrorCode.UNAUTHORIZED));
    }
  };
  
export default authMiddleware;
