"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stats_1 = require("../../controllers/stats/stats");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/ventas-mensuales", stats_1.ventasEstadisticas);
router.post("/generarReporteQuincenal", stats_1.generarReporteQuincenal);
exports.default = router;
