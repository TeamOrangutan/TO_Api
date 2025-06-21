import express from "express";
import {
  createProduct,
  deleteProductById,
  getProductById,
  getProducts,
  updateProductById,
  addToCart,
  getCarrito,
  deleteItemCarrito,
  updateItemCarrito,
  getResumenInventario,

} from "../../controllers/store/product";
import path from "path";
import multer from 'multer';
import { authenticate } from "../../controllers/auth/auth.middleware";

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, '../../../uploads'));  // Ruta donde guardar
  },
  filename: function (_req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);  // Nombre único
  },
});

const upload = multer({ storage });;
const router = express.Router();

// Rutas de productos
router.post("/", createProduct);
router.get("/",getProducts);

router.get("/resumenInventario",getResumenInventario);


router.get("/:id",getProductById);
router.put("/:id", authenticate,upload.array("images", 2), updateProductById);
router.delete("/:id", deleteProductById);
router.delete("/carrito/:carritoId/item/:carritoItemId", authenticate,deleteItemCarrito);

router.put("/updateProductItem/:carritoItemId/", updateItemCarrito);


router.get("/carrito/:usuarioId", authenticate,getCarrito);  


router.post("/carrito", authenticate,async (req, res) => {
  try {
    await addToCart(req, res);
  } catch (error) {
    console.error("Error en la ruta del carrito:", error);
    res.status(500).json({ error: "Hubo un problema al agregar al carrito." });
  }
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
