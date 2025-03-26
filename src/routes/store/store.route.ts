import express from "express";
import {
  createProduct,
  deleteProductById,
  getProductById,
  getProducts,
  updateProductById,
  addToCart,
  getCarrito
} from "../../controllers/store/product";
import path from "path";

const router = express.Router();

// Rutas de productos
router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProductById);
router.delete("/:id", deleteProductById);
router.get("/carrito", getCarrito);  // Ruta para obtener el carrito

// Ruta para agregar al carrito
router.post("/carrito", async (req, res) => {
  try {
    await addToCart(req, res);  // Llamar al controlador addToCart
  } catch (error) {
    console.error("Error en la ruta del carrito:", error);
    res.status(500).json({ error: "Hubo un problema al agregar al carrito." });
  }
});

// Ruta para servir archivos estáticos
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
