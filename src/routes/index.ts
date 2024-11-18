import express from "express";
import  router  from "../routes/store/store.route";


const AppProduct = express.Router();

AppProduct.use("/products", router);

AppProduct.use("/api/productos", router); // Ruta para obtener productos


export default AppProduct;
