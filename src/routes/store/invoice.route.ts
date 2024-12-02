import express from "express";
import {
  createInvoice,  
} from "../../controllers/store/invoice";

const Invoicerouter = express.Router();

Invoicerouter.post("/", createInvoice);

export default Invoicerouter;
