import { Router } from "express";
import { login, requestPasswordReset, resetPassword } from "../../controllers/auth/login.auth";
import { register } from "../../controllers/auth/register.auth";
import { googleAuth } from "../../controllers/auth/auth.google";

const authRouter = Router();

// Rutas de autenticación
authRouter.post('/login', login);
authRouter.post('/register', register);

authRouter.post('/google', googleAuth);



authRouter.post("/forgot-password", requestPasswordReset);
authRouter.post("/reset-password/:token", resetPassword);


export default authRouter;
