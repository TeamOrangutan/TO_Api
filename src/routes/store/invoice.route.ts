import { Router } from "express";
import { createInvoice, getInvoiceDetails, getInvoices } from "../../controllers/store/invoice";

const Invoicerouter = Router();

Invoicerouter.post("/", createInvoice);
Invoicerouter.get("/", getInvoices);
Invoicerouter.get("/:id", getInvoiceDetails);

export default Invoicerouter;