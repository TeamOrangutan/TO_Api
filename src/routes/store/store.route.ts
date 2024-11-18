import express from "express";
import { createProduct, getProducts, updateProductById } from "../../controllers/store/product";
import path from "path";
const router = express.Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.put('/', updateProductById)





















router.get("/file/:fileName", function (req, res) {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, "../../uploads", fileName);

  res.sendFile(filePath, function (err) {
    if (err) {
      console.error("Error al enviar el archivo:", err);
      res.status(500).send("Archivo no encontrado o error interno.");
    } else {
      console.log(`Archivo enviado: ${fileName}`);
    }
  });
});

export default router;
