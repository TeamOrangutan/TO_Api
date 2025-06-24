// utils/multer.ts
import multer from 'multer';

const storage = multer.memoryStorage(); // <-- Esto es clave
export const upload = multer({ storage });
