import { Router } from "express";
import { createInvoice, getInvoices } from "../../controllers/store/invoice";

const Invoicerouter = Router();

Invoicerouter.post("/", createInvoice);
Invoicerouter.get("/", getInvoices);

export default Invoicerouter;