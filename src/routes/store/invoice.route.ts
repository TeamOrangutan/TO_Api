import express from "express";
import {
  createInvoice,
  getSales,  
} from "../../controllers/store/invoice";

const Invoicerouter = express.Router();

Invoicerouter.post("/", createInvoice);
Invoicerouter.get("/", getSales);

export default Invoicerouter;
