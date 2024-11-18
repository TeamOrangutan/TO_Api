import express from "express";
import  router  from "../routes/store/store.route";

const AppProduct = express.Router();

AppProduct.use("/products", router);

export default AppProduct;
