import { Router } from "express";
import { Login } from "../../controllers/auth/login.auth";

export const authRouter = Router();

authRouter.get('/login', Login)

