import { Router } from "express";
import { login } from "../../controllers/auth/login.auth";
import { register } from "../../controllers/auth/register.auth";

const authRouter = Router();

// Rutas de autenticación
authRouter.post('/login', login);
authRouter.post('/register', register);

export default authRouter;
