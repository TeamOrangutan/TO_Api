"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const orders_1 = require("../../controllers/orders/orders");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/all/:usuarioId", orders_1.getAllOrders);
router.get("/all/", orders_1.getResumenOrdenes);
exports.default = router;
