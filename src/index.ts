import express, { Express } from "express";
import { PORT } from "./config";
import rootRouter from "./routes"
import { PrismaClient } from "@prisma/client";
import { errorMiddleware } from "./middlewares/errors";

const app:Express = express();

app.use(express.json()); 

app.use('/Api', rootRouter)

export const prismaclient = new PrismaClient({
  log:['query']
});

app.use(errorMiddleware)

app.listen(PORT, () => {  
  console.log('App working');  
});


