import { Router } from "express";
import { createInvoice, getInvoices, getSales } from "../../controllers/store/invoice";

const Invoicerouter = Router();

Invoicerouter.post("/", createInvoice);
Invoicerouter.get("/", getInvoices);
Invoicerouter.get('/Sales', getSales);

export default Invoicerouter;