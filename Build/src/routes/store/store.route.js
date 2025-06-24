"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_1 = require("../../controllers/store/product");
const auth_middleware_1 = require("../../controllers/auth/auth.middleware");
const multer_1 = require("../../utils/multer");
const router = express_1.default.Router();
// Rutas de productos
router.post("/", product_1.createProduct);
router.get("/", product_1.getProducts);
router.get("/resumenInventario", product_1.getResumenInventario);
router.get("/:id", product_1.getProductById);
router.put("/:id", auth_middleware_1.authenticate, multer_1.upload.array("images", 2), product_1.updateProductById);
router.delete("/:id", product_1.deleteProductById);
router.delete("/carrito/:carritoId/item/:carritoItemId", auth_middleware_1.authenticate, product_1.deleteItemCarrito);
router.put("/updateProductItem/:carritoItemId/", product_1.updateItemCarrito);
router.get("/carrito/:usuarioId", auth_middleware_1.authenticate, product_1.getCarrito);
router.post("/carrito", auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, product_1.addToCart)(req, res);
    }
    catch (error) {
        console.error("Error en la ruta del carrito:", error);
        res.status(500).json({ error: "Hubo un problema al agregar al carrito." });
    }
}));
// router.get("/file/uploads/:fileName", function (req, res) {
//   const fileName = req.params.fileName;
//   const filePath = path.join(__dirname, "../../../uploads", fileName);
//   res.sendFile(filePath, function (err) {
//     if (err) {
//       console.error("Error al enviar el archivo:", err);
//       res.status(500).send("Archivo no encontrado o error interno.");
//     } else {
//       console.log(`Archivo enviado: ${fileName}`);
//     }
//   });
// });
exports.default = router;
