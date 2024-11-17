import { Router } from "express";
import authRouter from "./auth/auth.route";

const rootRouter: Router = Router()

rootRouter.use('/auth', authRouter)

export default rootRouter;

/* import { Router } from "express";
import { authRouter } from "./auth/auth.route";
import { storeRouter } from "./store/store.route";

export const appRouter = Router()

appRouter.use('/auth', authRouter)
appRouter.use('/store', storeRouter)
 */