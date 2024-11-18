/* import { Usuario } from "@prisma/client"; */
import express from "express";

declare global {
    namespace Express {
        interface Request {
          usuario?: {
            user_pk: number;
            correo: string;
            nombre: string;
            rol_fk: number;
          };
      }
    }
  }