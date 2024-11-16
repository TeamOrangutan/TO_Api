import express from "express";
import { appRouter } from "./routes";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const app = express();

export const prismaclient = new PrismaClient();


const PORT = 3000;


app.use(express.json());
app.use('/Api', appRouter)

app.listen(PORT, () => {
  console.log("App listen in 3000");
});
