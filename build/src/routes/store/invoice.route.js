"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const invoice_1 = require("../../controllers/store/invoice");
const express_1 = __importDefault(require("express"));
// import {
//   createInvoice,
//   getAllInvoices,
//   getInvoiceProducts,
//   getSales,  
// } from "../../controllers/store/invoice";
const Invoicerouter = express_1.default.Router();
Invoicerouter.get("/all/:usuarioId", invoice_1.getAll);
Invoicerouter.get("/factura/:facturaId", invoice_1.getInvoiceById);
// Invoicerouter.post("/", createInvoice);
// Invoicerouter.get("/", getSales);
// Invoicerouter.get("/:id", getInvoiceProducts);
exports.default = Invoicerouter;
