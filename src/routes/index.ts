import express from "express";
import  router  from "../routes/store/store.route";
import invoiceRouter from "../routes/store/invoice.route";
import userRouter from "../routes/user/user.route";
import statsRouter from "../routes/stats/stats.route";


const AppProduct = express.Router();

AppProduct.use("/products", router);
AppProduct.use("/invoices", invoiceRouter);
AppProduct.use("/user", userRouter);
AppProduct.use("/stats", statsRouter);




export default AppProduct;