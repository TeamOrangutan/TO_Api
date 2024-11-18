import express from 'express';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import storeRoutes from './routes/store/store.route';
import path from 'path';

const app = express();

export const prismaclient = new PrismaClient();

const PORT = 3000;

app.use(bodyParser.json());
app.use(express.json());

// Habilitar el acceso a los archivos estáticos de la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', storeRoutes);

app.listen(PORT, () => {
  console.log(`App listening on port 3000`);
});
