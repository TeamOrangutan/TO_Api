import { Router } from "express";
import { Login, signup } from "../../controllers/auth/auth";

export const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", Login); 

export default authRouter
