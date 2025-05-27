import { getAll, getInvoiceById } from "../../controllers/store/invoice";
import express from "express";
// import {
//   createInvoice,
//   getAllInvoices,
//   getInvoiceProducts,
//   getSales,  
// } from "../../controllers/store/invoice";

const Invoicerouter = express.Router();

Invoicerouter.get("/all/:usuarioId", getAll);
Invoicerouter.get("/factura/:facturaId", getInvoiceById);

// Invoicerouter.post("/", createInvoice);
// Invoicerouter.get("/", getSales);
// Invoicerouter.get("/:id", getInvoiceProducts);


export default Invoicerouter;
