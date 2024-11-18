import express from "express";
import {
  createProduct,
  getProductById,
  getProducts,
  updateProductById,
} from "../../controllers/store/product";
import path from "path";
import { prismaclient } from "../../index";

const router = express.Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.get('/:id', getProductById)
router.put("/", updateProductById);
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!id || !Number(id)) throw Error("Id not send");

  await prismaclient.iMAGEN.deleteMany({
    where: {
      producto_fk: Number(id)
    }
  })  
  const data = await prismaclient.pRODUCTOS.delete({
    where: {
      producto_pk: Number(id),
    },
  });
  res.json(data);
});

router.get("/file/uploads/:fileName", function (req, res) {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, "../../../uploads", fileName);

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
