import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { upload } from '../../utils/multer'; // Asegúrate de importar la configuración de multer

export const createProduct = (req: Request, res: Response) => {
  upload.array('images', 2)(req, res, async (err) => {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }

    try {
      // Asegúrate de que las imágenes fueron subidas correctamente
      if  (Array.isArray(req.files) && req.files.length < 2){
        return res.status(400).json({ error: 'Debes subir dos imágenes.' });
      }

      // Extraemos las imágenes del request
      const imagenes = (req.files as Express.Multer.File[]).map(file => file.path);

      const { nombre, precioVenta, descripcion } = req.body;

      // Validamos que todos los campos requeridos estén presentes
      if (!nombre || !precioVenta || !descripcion) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
      }

      // Guardamos el producto en la base de datos
      const producto = await prisma.pRODUCTOS.create({
        data: {
          nombre,
          precioVenta: parseFloat(precioVenta),
          descripcion,
        },
      });

      // Guardamos las imágenes en la tabla IMAGEN
      await prisma.iMAGEN.createMany({
        data: imagenes.map(imagenUrl => ({
          producto_fk: producto.producto_pk, // Asociamos la imagen con el producto
          url: imagenUrl,
        })),
      });

      return res.status(201).json({ message: 'Producto creado', data: producto });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al crear el producto' });
    }
  });
};
