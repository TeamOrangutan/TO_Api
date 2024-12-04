import { Router } from "express";
import { createInvoice, getInvoiceDetails, getInvoices, getSales } from "../../controllers/store/invoice";


const Invoicerouter = Router();

Invoicerouter.post("/", createInvoice);
Invoicerouter.get("/", getInvoices);
Invoicerouter.get('/Sales', getSales);
Invoicerouter.get("/:id", getInvoiceDetails);
Invoicerouter.get("/", getSales);

export default Invoicerouter;