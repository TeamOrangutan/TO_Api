import { Router } from "express";
import { createProduct, getProduct } from "../../controllers/store/product.store";

export const storeRouter = Router()

storeRouter.get('/product', getProduct)
storeRouter.post('/product', createProduct)