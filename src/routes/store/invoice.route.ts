import express from "express";
import {
  createInvoice,
  getInvoiceProducts,
  getSales,  
} from "../../controllers/store/invoice";

const Invoicerouter = express.Router();

Invoicerouter.post("/", createInvoice);
Invoicerouter.get("/", getSales);
Invoicerouter.get("/:id", getInvoiceProducts);

export default Invoicerouter;
