import { Request, Response } from "express";
import { prisma } from "../../prisma";
import { upload } from "../../utils/multer";
import { prismaclient } from "../../index";
export const createProduct = (req: Request, res: Response) => {
  upload.array("images", 2)(req, res, async (err) => {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }

    try {
      // Asegúrate de que se hayan subido al menos dos imágenes
      if (Array.isArray(req.files) && req.files.length < 2) {
        return res.status(400).json({ error: "Debes subir dos imágenes." });
      }

      // Obtener las rutas de las imágenes subidas
      const imagenes = (req.files as Express.Multer.File[]).map(
        (file) => file.path // file.path te da la ruta donde la imagen fue guardada
      );

      const { nombre, precioVenta, descripcion } = req.body;

      if (!nombre || !precioVenta || !descripcion) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
      }

      // Crear el producto
      const producto = await prisma.pRODUCTOS.create({
        data: {
          nombre,
          precioVenta: parseFloat(precioVenta),
          descripcion,
        },
      });

      await prisma.rEGISTRO.create({
        data: {
          producto_fk: producto.producto_pk,
          fecha: new Date(),
        },
      });

      // Guardar las imágenes asociadas al producto
      await prisma.iMAGEN.createMany({
        data: imagenes.map((imagenUrl) => ({
          producto_fk: producto.producto_pk,
          url: imagenUrl,
        })),
      });

      return res
        .status(201)
        .json({ message: "Producto creado", data: producto });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error al crear el producto" });
    }
  });
};

export const getProducts = async (_req: Request, res: Response) => {
  try {
    // Obtener datos de las imágenes
    const imagedata = await prismaclient.iMAGEN.findMany({
      select: {
        producto_fk: true, // Relacionamos con el producto
        url: true, // La URL de la imagen
      },
    });

    // Obtener los datos de los productos
    const productData = await prismaclient.pRODUCTOS.findMany({
      select: {
        producto_pk: true,
        nombre: true,
        precioVenta: true,
        descripcion: true,
        registros: {
          select: {
            fecha: true,
          },
        },
      },
    });

    const products = productData.map((product) => {
      const productImages = imagedata
        .filter((image) => image.producto_fk === product.producto_pk)
        .map((image) => image.url);
      const publicationDate =
        product.registros.length > 0 ? product.registros[0].fecha : null;

      return {
        id: product.producto_pk,
        name: product.nombre,
        path: productImages[0] || "",
        estado: "disponible",
        description: product.descripcion,
        price: product.precioVenta,
        hoverPath: productImages[1] || "",
        fecha_de_publicacion: publicationDate,
      };
    });

    res.json(products);
    console.log(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  try {
    const product = await prisma.pRODUCTOS.findFirst({
      where: {
        producto_pk: Number(id),
      },
      select: {
        producto_pk: true,
        nombre: true,
        precioVenta: true,
        descripcion: true,
        registros: {
          select: {
            fecha: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const imagedata = await prisma.iMAGEN.findMany({
      select: {
        producto_fk: true,
        url: true,
      },
    });

    const productImages = imagedata
      .filter((image) => image.producto_fk === product?.producto_pk)
      .map((image) => image.url);

    const publicationDate =
      product.registros.length > 0 ? product.registros[0].fecha : null;

    res.json({
      id: product.producto_pk,
      name: product.nombre,
      path: productImages[0] || '',
      estado: 'disponible',
      description: product.descripcion,
      price: product.precioVenta,
      hoverPath: productImages[1] || '',
      fecha_de_publicacion: publicationDate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateProductById = async (req: Request, _res: Response) => {
  const [idProduct, nombre] = req.body;

  const id = Number(idProduct);

  await prismaclient.pRODUCTOS.update({
    where: {
      producto_pk: id,
    },
    data: {
      nombre: nombre,
      precioVenta: 0,
    },
  });
};
export const deleteProductById = async (_req: Request, _res: Response) => {};

export const deleteProductHandler = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const parseId = Number(id);

  try {
    const product = await prismaclient.pRODUCTOS.findUnique({
      where: { producto_pk: parseId },
    });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const result = await prismaclient.pRODUCTOS.delete({
      where: { producto_pk: parseId },
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    return res.status(500).send("Error al eliminar el producto");
  }
};
