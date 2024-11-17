import express, { Express } from "express";
import { PORT } from "./config";
import rootRouter from "./routes/index"
import { PrismaClient } from "@prisma/client";

const app:Express = express();

app.use(express.json()); 

app.use('/Api', rootRouter)

export const prismaclient = new PrismaClient({
  log:['query']
});

app.listen(PORT, () => {  
  console.log(`App listen in some POrt xd`);  
});


