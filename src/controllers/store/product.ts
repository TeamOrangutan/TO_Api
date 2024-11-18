import { Request, Response, NextFunction } from "express";
import { prisma } from "../../prisma";
import { upload } from '../../utils/multer';  // Ajusta la ruta según la estructura de tus carpetas


export const getProducts = async (
  _req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const productos = await prisma.pRODUCTOS.findMany({
      include: {
        imagenes: true,
        inventarios: true,
        detalles: true
      }
    });

    const formattedProductos = productos.map((producto) => ({
      product_pk: producto.producto_pk,
      nombre: producto.nombre,
      precioVenta: producto.precioVenta,
      descripcion: producto.descripcion,
      estado: producto.estado,
      detalles: producto.detalles,  // Aquí tomas los detalles correctamente
      fecha: producto.createdAt,  // Fecha de creación
      imagenes: producto.imagenes.map((imagen) => imagen.url),  // URLs de las imágenes
      inventario: producto.inventarios.map((inv) => ({
        stock: inv.stock,
        precioCompra: inv.precioCompra,
      }))
    }));

    res.status(200).json({
      message: "Productos recuperados con éxito",
      data: formattedProductos
    });
  } catch (error) {
    next(error); // Usa `next` para pasar errores a un middleware de manejo de errores
  }
};
export const createProduct = (req: Request, res: Response) => {
  upload.array("images", 2)(req, res, async (err) => {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }

    try {
      if (Array.isArray(req.files) && req.files.length < 2) {
        return res.status(400).json({ error: "Debes subir dos imágenes." });
      }

      // Procesar imágenes
      const imagenes = (req.files as Express.Multer.File[]).map(
        (file) => file.path
      );

      // Obtener datos del body
      const { nombre, precioVenta, descripcion, detalles, cantidad, precioCompra, estado } = req.body;

      if (!nombre || !precioVenta || !descripcion || !cantidad || !precioCompra) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
      }

      // Asegurarse de que 'detalles' sea un string, no un JSON
      const detallesArray = detalles ? detalles.split(',') : [];

      // Crear producto
      const producto = await prisma.pRODUCTOS.create({
        data: {
          nombre,
          precioVenta: parseFloat(precioVenta),
          descripcion,
          estado: estado || "activo", // Estado proporcionado o "activo" por defecto
          detalles: {
            create: detallesArray.map((detalle: string) => ({
              descripcion: detalle.trim() // Crear detalle con la descripción
            })),
          },
        },
      });

      // Guardar imágenes en la tabla IMAGEN
      await prisma.iMAGEN.createMany({
        data: imagenes.map((imagenUrl) => ({
          producto_fk: producto.producto_pk,
          url: imagenUrl,
        })),
      });

      // Crear registro en inventario
      await prisma.iNVENTARIO.create({
        data: {
          producto_fk: producto.producto_pk,
          stock: parseInt(cantidad) || 0,
          precioCompra: parseFloat(precioCompra), // Incluir precioCompra
        },
      });

      return res.status(201).json({
        message: "Producto creado exitosamente",
        data: producto,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al crear el producto" });
    }
  });
};



export const updateProductById = async (req: Request, _res: Response) => {
  const [idProduct, nombre] = req.body;
  const id = Number(idProduct);

  await prisma.pRODUCTOS.update({
    where: {
      producto_pk: id,
    },
    data: {
      nombre: nombre,
      precioVenta: 0,
    },
  });
};