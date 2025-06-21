import { getAllOrders, getResumenOrdenes } from "../../controllers/orders/orders";
import express from "express";

const router = express.Router();



router.get("/all/:usuarioId", getAllOrders);  
router.get("/all/", getResumenOrdenes);  




export default router;
