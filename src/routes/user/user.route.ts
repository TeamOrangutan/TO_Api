import { getAllUsers, updateStateUser } from "../../controllers/user/users";
import { authenticate } from "../../controllers/auth/auth.middleware";
import { updateUserData, userProfile } from "../../controllers/user/profile";
import express from "express";
import multer from "multer";
import path from "path";

const storageUsuario = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.join(__dirname, "../../../uploads/usuarios"));
  },
  filename: function (req, file, cb) {
    const { nombres, apellidos } = req.body;

    const nombreLimpio = nombres
      ? nombres.trim().toLowerCase().replace(/\s+/g, "-")
      : "user";
    const apellidoLimpio = apellidos
      ? apellidos.trim().toLowerCase().replace(/\s+/g, "-")
      : "profile";

    const extension = path.extname(file.originalname);

    const nombreArchivo = `${nombreLimpio}-${apellidoLimpio}-${Date.now()}${extension}`;

    cb(null, nombreArchivo);
  },
});

export const uploadUsuario = multer({ storage: storageUsuario });

const router = express.Router();

router.get("/profile/:usuarioId", authenticate, userProfile);

router.put("/State/", updateStateUser);

router.get("/AllUsers/", getAllUsers);


router.put(
  "/updateuserdata/:usuarioId",
  uploadUsuario.single("imagenPerfil"),
  updateUserData
);

router.get("/file/uploads/user/:fileName", function (req, res) {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, "../../../uploads/usuarios", fileName);

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
