import express from "express";
import {
  createInvoice,
  getAllInvoices,
  getInvoiceProducts,
  getSales,  
} from "../../controllers/store/invoice";

const Invoicerouter = express.Router();

Invoicerouter.get("/All", getAllInvoices);

Invoicerouter.post("/", createInvoice);
Invoicerouter.get("/", getSales);
Invoicerouter.get("/:id", getInvoiceProducts);


export default Invoicerouter;
