import express from 'express';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';

import path from 'path';
import AppProduct from './routes/index';
import cors from 'cors'
import morgan from 'morgan'

const app = express();

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

export const prismaclient = new PrismaClient();

const PORT = 3000;

app.use(bodyParser.json());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', AppProduct);

app.listen(PORT, () => {
  console.log(`App listening on port 3000`);
});
