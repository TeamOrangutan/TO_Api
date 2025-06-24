"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const users_1 = require("../../controllers/user/users");
const auth_middleware_1 = require("../../controllers/auth/auth.middleware");
const profile_1 = require("../../controllers/user/profile");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const multer_1 = require("../../utils/multer");
// const storageUsuario = multer.diskStorage({
//   destination: function (_req, _file, cb) {
//     cb(null, path.join(__dirname, "../../../uploads/usuarios"));
//   },
//   filename: function (req, file, cb) {
//     const { nombres, apellidos } = req.body;
//     const nombreLimpio = nombres
//       ? nombres.trim().toLowerCase().replace(/\s+/g, "-")
//       : "user";
//     const apellidoLimpio = apellidos
//       ? apellidos.trim().toLowerCase().replace(/\s+/g, "-")
//       : "profile";
//     const extension = path.extname(file.originalname);
//     const nombreArchivo = `${nombreLimpio}-${apellidoLimpio}-${Date.now()}${extension}`;
//     cb(null, nombreArchivo);
//   },
// });
// export const uploadUsuario = multer({ storage: storageUsuario });
const router = express_1.default.Router();
router.get("/profile/:usuarioId", auth_middleware_1.authenticate, profile_1.userProfile);
router.put("/State/", users_1.updateStateUser);
router.get("/AllUsers/", users_1.getAllUsers);
router.put("/updateuserdata/:usuarioId", multer_1.upload.single("imagenPerfil"), profile_1.updateUserData);
router.get("/file/uploads/user/:fileName", function (req, res) {
    const fileName = req.params.fileName;
    const filePath = path_1.default.join(__dirname, "../../../uploads/usuarios", fileName);
    res.sendFile(filePath, function (err) {
        if (err) {
            console.error("Error al enviar el archivo:", err);
            res.status(500).send("Archivo no encontrado o error interno.");
        }
        else {
            console.log(`Archivo enviado: ${fileName}`);
        }
    });
});
exports.default = router;
