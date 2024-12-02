import express from "express";
import  router  from "../routes/store/store.route";
import invoiceRouter from "../routes/store/invoice.route";


const AppProduct = express.Router();

AppProduct.use("/products", router);
AppProduct.use("/invoices", invoiceRouter);

export default AppProduct;
