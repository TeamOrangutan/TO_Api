import { Router } from "express";
import { createInvoice, getInvoices, getSales, getInvoiceDetails } from "../../controllers/store/invoice";


const Invoicerouter = Router();

Invoicerouter.post("/", createInvoice);
Invoicerouter.get("/", getInvoices);
Invoicerouter.get('/Sales', getSales);
Invoicerouter.get("/:id", getInvoiceDetails);

export default Invoicerouter;