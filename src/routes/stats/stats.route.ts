import { generarReporteQuincenal, ventasEstadisticas } from "../../controllers/stats/stats";
import express from "express";

const router = express.Router();

router.get("/ventas-mensuales", ventasEstadisticas);  
router.post("/generarReporteQuincenal", generarReporteQuincenal);  

export default router;