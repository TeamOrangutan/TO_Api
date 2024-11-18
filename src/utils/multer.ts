import multer from 'multer';
import path from 'path';

// Configuración para el almacenamiento local de archivos
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, 'uploads/'); // Ruta donde se guardarán los archivos subidos
  },
  filename: function (_req, file, cb) {
    // Establece un nombre único para cada archivo subido
    cb(null, Date.now() + path.extname(file.originalname)); // Ejemplo: 1632203023254.jpg
  },
});

// Define las reglas de carga de los archivos
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de tamaño de archivo: 5 MB
  },
  fileFilter: (_req, file, cb) => {
    const fileTypes = /jpg|jpeg|png|gif/; // Acepta solo imágenes de tipo JPG, JPEG, PNG o GIF
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      return cb(null, true); // Archivo válido
    } else {
      cb(new Error('Solo se permiten imágenes (JPG, JPEG, PNG, GIF)'));
    }
  },
});

export { upload };
