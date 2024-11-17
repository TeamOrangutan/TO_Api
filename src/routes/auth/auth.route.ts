/* import { Router } from "express";
import { login} from "../../controllers/auth/auth";

export const authRouter = Router();
authRouter.get("/login", login); 

export default authRouter */

import { Router } from "express";
import { Login, signup } from "../../controllers/auth/auth";

const authRouter: Router = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", Login); 

export default authRouter
