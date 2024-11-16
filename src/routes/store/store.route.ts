import { Router } from "express";
import { createProduct, getProduct } from "../../controllers/store/product.store";
import { verifyToken } from "../../middlewares/auth";

export const storeRouter = Router()

storeRouter.get('/product', verifyToken, getProduct);
storeRouter.post('/product', verifyToken, createProduct);