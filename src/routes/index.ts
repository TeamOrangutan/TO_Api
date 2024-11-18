import express from "express";
import  router  from "../routes/store/store.route";

const AppProduct = express.Router();

// Ruta para crear producto
AppProduct.post("/products", router);

export default AppProduct;
