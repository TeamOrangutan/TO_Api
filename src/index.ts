import express from 'express';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import AppProduct from './routes/index';
import cors from 'cors';
import authRouter from './routes/auth/auth.route';  
import expressOasGenerator from 'express-oas-generator';
import paypalRouter from './routes/payments/checkout.route';
import orderRoute from './routes/orders/orders.route';

const app = express();

// Inicializar express-oas-generator antes de cualquier middleware
expressOasGenerator.init(app, {});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

export const prismaclient = new PrismaClient();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', AppProduct);
app.use('/api/auth', authRouter);
app.use('/api/payments', paypalRouter);
app.use('/api/orders', orderRoute);

app.get('/', (_req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});


process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});