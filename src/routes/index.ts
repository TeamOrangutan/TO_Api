import express from "express";
import  router  from "../routes/store/store.route";
import invoiceRouter from "../routes/store/invoice.route";
import userRouter from "../routes/user/user.route";


const AppProduct = express.Router();

AppProduct.use("/products", router);
AppProduct.use("/invoices", invoiceRouter);
AppProduct.use("/user", userRouter);




export default AppProduct;