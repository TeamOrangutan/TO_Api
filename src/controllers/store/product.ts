import { Request, Response } from "express";
import { upload } from "../../utils/multer";
import { prismaclient } from "../../index";

interface Talla {
  nombre: string;
  cantidad: number;
}

interface Product {
  nombre: string;
  descripcion: string;
  precioVenta: number;
  estado: string;
  tallas: Talla[];
}

export const createProduct = (req: Request, res: Response) => {
  // Middleware de multer para manejar múltiples imágenes (máximo 10)
  upload.array("images", 10)(req, res, async (err) => {
    if (err) {
      if (err instanceof Error) {
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: "Error al subir las imágenes." });
    }

    // Agregar estos console.log para depurar
    console.log("Headers:", req.headers); // Muestra las cabeceras de la solicitud
    console.log("Files:", req.files); // Muestra los archivos subidos

    try {
      // Validar si se subieron imágenes
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res
          .status(400)
          .json({ error: "Se deben subir al menos una imagen." });
      }

      // Validar que los archivos sean imágenes
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      const invalidFiles = req.files.filter(
        (file: any) => !validImageTypes.includes(file.mimetype)
      );

      if (invalidFiles.length > 0) {
        return res
          .status(400)
          .json({
            error: "Solo se permiten archivos de imagen (JPG, PNG, GIF).",
          });
      }

      // Obtener las rutas de las imágenes subidas
      const imagenes = req.files.map((file: Express.Multer.File) => file.path);

      // Extraer datos del cuerpo de la solicitud
      const { nombre, precioVenta, descripcion, estado, tallas } = req.body;

      console.log(tallas);

      // Validar que los datos requeridos estén presentes
      if (!nombre || !precioVenta || !descripcion || !tallas) {
        return res.status(400).json({ error: "Faltan datos requeridos." });
      }

      let tallasData;
      try {
        tallasData = JSON.parse(tallas);
      } catch (error) {
        return res
          .status(400)
          .json({ error: "El campo 'tallas' debe ser un JSON válido." });
      }

      if (!Array.isArray(tallasData)) {
        return res
          .status(400)
          .json({ error: "El campo 'tallas' debe ser un arreglo." });
      }

      // Validar que cada talla tenga 'nombre' y 'cantidad'
      for (let talla of tallasData) {
        if (!talla.nombre || !talla.cantidad) {
          return res
            .status(400)
            .json({ error: "Cada talla debe tener un nombre y una cantidad." });
        }
      }

      // Crear el producto en la base de datos
      const producto = await prismaclient.pRODUCTOS.create({
        data: {
          nombre,
          precioVenta: parseFloat(precioVenta),
          descripcion,
          estado: estado || "disponible", // Estado por defecto
        },
      });

      // Procesar las tallas
      const tallasRecords = tallasData.map((talla: any) => ({
        nombre: talla.nombre,
        cantidad: talla.cantidad,
        producto_fk: producto.producto_pk,
      }));

      // Crear las tallas asociadas al producto
      await prismaclient.tALLA.createMany({
        data: tallasRecords,
      });

      // Registrar en INVENTARIO con los datos iniciales
      await prismaclient.iNVENTARIO.create({
        data: {
          precioCompra: 0, // Suponiendo que no tienes un precio de compra al crear
          stock: tallasRecords.reduce(
            (total: number, talla: any) => total + talla.cantidad,
            0
          ),
          producto_fk: producto.producto_pk,
        },
      });

      // Registrar las imágenes asociadas al producto
      await prismaclient.iMAGEN.createMany({
        data: imagenes.map((url) => ({
          url,
          producto_fk: producto.producto_pk,
        })),
      });

      // Registrar el producto en la tabla REGISTRO
      await prismaclient.rEGISTRO.create({
        data: {
          producto_fk: producto.producto_pk,
          fecha: new Date(),
        },
      });

      // Obtener las tallas asociadas al producto
      const tallasRegistradas = await prismaclient.tALLA.findMany({
        where: { producto_fk: producto.producto_pk },
      });

      // Enviar la respuesta exitosa
      return res.status(201).json({
        message: "Producto creado con éxito",
        data: {
          ...producto,
          tallas: tallasRegistradas, // Incluir las tallas en la respuesta
        },
        imagenes, // Incluir las imágenes asociadas al producto
      });
    } catch (error) {
      console.error("Error al crear producto:", error);
      return res
        .status(500)
        .json({ error: "Error interno al crear el producto." });
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
        estado: true,
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
        estado: product.estado,
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

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  try {
    const product = await prismaclient.pRODUCTOS.findFirst({
      where: {
        producto_pk: Number(id),
      },
      select: {
        producto_pk: true,
        nombre: true,
        precioVenta: true,
        descripcion: true,
        tallas: true,
        estado: true,
        registros: {
          select: {
            fecha: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const imagedata = await prismaclient.iMAGEN.findMany({
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
      path: productImages[0] || "",
      estado: product.estado,
      description: product.descripcion,
      price: product.precioVenta,
      hoverPath: productImages[1] || "",
      fecha_de_publicacion: publicationDate,
      stock: product.tallas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateProductById = async (req: Request, res: Response) => {
  const { nombre, descripcion, precioVenta, estado, tallas }: Product =
    req.body;
  const { id } = req.params;

  console.log(tallas);

  try {
    await prismaclient.pRODUCTOS.updateMany({
      where: {
        producto_pk: Number(id),
      },
      data: {
        nombre: nombre,
        precioVenta: Number(precioVenta),
        descripcion: descripcion ,
        estado: estado,
      },
    });


    const tallaData = (tallas || []).map((talla) => ({
      nombre: talla.nombre,
      cantidad: Number(talla.cantidad),
      producto_fk: Number(id)
    }));
    
    await prismaclient.tALLA.deleteMany({
      where: {
        producto_fk: Number(id)
      }
    });
    
    await prismaclient.tALLA.createMany({
      data: tallaData
    })

    res.status(200).send("Producto actualizado correctamente");
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).send("Error interno al actualizar el producto");
  }
};

export const deleteProductById = async (req: Request, res: Response) => {
  const { id } = req.params;

  await prismaclient.iMAGEN.deleteMany({
    where: {
      producto_fk: Number(id),
    },
  });
  await prismaclient.fAC_PRODUCTO.deleteMany({
    where: {
      producto_fk: Number(id),
    },
  });

  await prismaclient.rEGISTRO.deleteMany({
    where: {
      producto_fk: Number(id),
    },
  });

  const data = await prismaclient.pRODUCTOS.delete({
    where: {
      producto_pk: Number(id),
    },
  });

  res.json(data);
};
