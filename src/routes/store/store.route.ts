import express from 'express';
import { createProduct } from '../../controllers/store/product'; // Asegúrate de que la ruta sea correcta

const router = express.Router();

// Ruta para crear el producto con imagen
router.post('/products', createProduct);

export default router;
