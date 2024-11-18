import express from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import AppProduct from './routes/index';

const app = express();

export const prismaclient = new PrismaClient();
const PORT = 3000;

// Middleware
app.use(express.json());

// Servir archivos estáticos (subidas de imágenes, por ejemplo)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de rutas
app.use('/api', AppProduct);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`App listening on port 3000`);
});
