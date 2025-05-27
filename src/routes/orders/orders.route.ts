import { getAllOrders } from "../../controllers/orders/orders";
import express from "express";

const router = express.Router();



router.get("/all/:usuarioId", getAllOrders);  




export default router;
