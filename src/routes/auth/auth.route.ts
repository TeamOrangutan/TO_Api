import { Router } from "express";
import { Login, signup } from "../../controllers/auth/auth";
import { errorHandler } from "../../error-handler";

const authRouter: Router = Router();

authRouter.post("/signup", errorHandler(signup));
authRouter.post("/login", errorHandler(Login)); 

export default authRouter
