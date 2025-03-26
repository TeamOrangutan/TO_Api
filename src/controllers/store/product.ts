import { Request, Response } from "express";
import { prisma } from "../../prisma";
import { upload } from "../../utils/multer";
import { prismaclient } from "../../index";
import Decimal from "decimal.js";

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
        return res.status(400).json({ error: "Se deben subir al menos una imagen." });
      }

      // Validar que los archivos sean imágenes
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif']; 
      const invalidFiles = req.files.filter((file: any) => !validImageTypes.includes(file.mimetype));

      if (invalidFiles.length > 0) {
        return res.status(400).json({ error: "Solo se permiten archivos de imagen (JPG, PNG, GIF)." });
      }

      // Obtener las rutas de las imágenes subidas
      const imagenes = req.files.map((file: Express.Multer.File) => file.path);

      // Extraer datos del cuerpo de la solicitud
      const { nombre, precioVenta, descripcion, estado, tallas } = req.body;

      // Validar que los datos requeridos estén presentes
      if (!nombre || !precioVenta || !descripcion || !tallas) {
        return res.status(400).json({ error: "Faltan datos requeridos." });
      }

      let tallasData;
      try {
        tallasData = JSON.parse(tallas);
      } catch (error) {
        return res.status(400).json({ error: "El campo 'tallas' debe ser un JSON válido." });
      }

      if (!Array.isArray(tallasData)) {
        return res.status(400).json({ error: "El campo 'tallas' debe ser un arreglo." });
      }

      // Validar que cada talla tenga 'nombre' y 'cantidad'
      for (let talla of tallasData) {
        if (!talla.nombre || !talla.cantidad) {
          return res.status(400).json({ error: "Cada talla debe tener un nombre y una cantidad." });
        }
      }

      // Crear el producto en la base de datos
      const producto = await prisma.pRODUCTOS.create({
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
      await prisma.tALLA.createMany({
        data: tallasRecords,
      });

      // Registrar en INVENTARIO con los datos iniciales
      await prisma.iNVENTARIO.create({
        data: {
          precioCompra: 0, // Suponiendo que no tienes un precio de compra al crear
          stock: tallasRecords.reduce((total: number, talla: any) => total + talla.cantidad, 0),
          producto_fk: producto.producto_pk,
        },
      });

      // Registrar las imágenes asociadas al producto
      await prisma.iMAGEN.createMany({
        data: imagenes.map((url) => ({
          url,
          producto_fk: producto.producto_pk,
        })),
      });

      // Registrar el producto en la tabla REGISTRO
      await prisma.rEGISTRO.create({
        data: {
          producto_fk: producto.producto_pk,
          fecha: new Date(),
        },
      });

      // Obtener las tallas asociadas al producto
      const tallasRegistradas = await prisma.tALLA.findMany({
        where: { producto_fk: producto.producto_pk }
      });

      // Enviar la respuesta exitosa
      return res.status(201).json({
        message: "Producto creado con éxito",
        data: {
          ...producto,
          tallas: tallasRegistradas,  // Incluir las tallas en la respuesta
        },
        imagenes, // Incluir las imágenes asociadas al producto
      });
    } catch (error) {
      console.error("Error al crear producto:", error);
      return res.status(500).json({ error: "Error interno al crear el producto." });
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
export const addToCart = async (req: Request, res: Response): Promise<Response> => {
  const { productoId, cantidad, guestId, usuarioId } = req.body;

  if (!productoId || !cantidad || (!guestId && !usuarioId)) {
    return res.status(400).send("Faltan datos necesarios");
  }

  try {
    // Buscar el producto por su ID
    const producto = await prisma.pRODUCTOS.findUnique({
      where: { producto_pk: Number(productoId) },
    });

    if (!producto) {
      return res.status(404).send("Producto no encontrado");
    }

    // Determinar si es un carrito de invitado o registrado
    let carrito;

    const whereConditions: any[] = [];

    // Si el usuario está registrado, agregamos la condición para usuario_fk
    if (usuarioId) {
      whereConditions.push({ usuario_fk: Number(usuarioId) });
    }

    // Si es un carrito de invitado, agregamos la condición para guestId
    if (guestId) {
      whereConditions.push({ guestId: guestId });
    }

    // Buscar el carrito con las condiciones agregadas
    if (whereConditions.length > 0) {
      carrito = await prisma.cARRITO.findFirst({
        where: {
          OR: whereConditions,
        },
      });
    }

    // Si no existe un carrito, creamos uno nuevo
    if (!carrito) {
      const carritoData: any = {
        total: new Decimal(0), // Total inicial
      };

      // Si hay usuarioId, agregamos usuario_fk al carrito
      if (usuarioId) {
        carritoData.usuario_fk = Number(usuarioId);
      }

      // Si hay guestId, agregamos guestId al carrito
      if (guestId) {
        carritoData.guestId = guestId;
      }

      // Aseguramos que si hay guestId, no asignamos usuario_fk
      if (guestId) {
        delete carritoData.usuario_fk; // Elimina usuario_fk si es un carrito de invitado
      }

      carrito = await prisma.cARRITO.create({
        data: carritoData,
      });
    }

    // Calcular el total del producto a agregar
    const totalProducto = new Decimal(cantidad).mul(new Decimal(producto.precioVenta));

    // Actualizar el total del carrito con el nuevo producto
    carrito = await prisma.cARRITO.update({
      where: { carrito_pk: carrito.carrito_pk },
      data: {
        total: new Decimal(carrito.total).add(totalProducto),
      },
    });

    // Crear el item en el carrito
    await prisma.cARRITO_ITEM.create({
      data: {
        cantidad: Number(cantidad),
        producto_fk: Number(productoId),
        carrito_fk: carrito.carrito_pk,
      },
    });

    return res.status(200).send("Producto agregado al carrito correctamente");
  } catch (error) {
    console.error("Error al agregar producto al carrito:", error);
    return res.status(500).send("Error interno al agregar el producto al carrito");
  }
};
// Función para obtener el carrito

export const getCarrito = async (req: Request, res: Response): Promise<void> => {
  const { guestId, usuarioId } = req.query;

  // Verificar que al menos uno de los identificadores esté presente
  if (!guestId && !usuarioId) {
    res.status(400).json({ error: "Faltan datos necesarios" });
    return;
  }

  try {
    // Determinar si es un carrito de invitado o registrado
    let carrito;

    const whereConditions: any[] = [];

    // Si el usuario está registrado, agregamos la condición para usuario_fk
    if (usuarioId) {
      whereConditions.push({ usuario_fk: Number(usuarioId) });
    }

    // Si es un carrito de invitado, agregamos la condición para guestId
    if (guestId) {
      whereConditions.push({ guestId: String(guestId) });
    }

    // Buscar el carrito con las condiciones agregadas
    carrito = await prisma.cARRITO.findFirst({
      where: {
        OR: whereConditions,
      },
      include: {
        items: {
          include: {
            producto: true, // Incluir los productos dentro del carrito
          }
        }
      }
    });

    if (!carrito) {
      res.status(404).json({ error: "Carrito no encontrado" });
      return;
    }

    // Calcular el total del carrito
    const total = carrito.items.reduce(
      (acc, item) => acc + (Number(item.cantidad) * Number(item.producto.precioVenta)),
      0
    );

    // Obtener imágenes de los productos en el carrito
    const imagedata = await prisma.iMAGEN.findMany({
      select: {
        producto_fk: true,
        url: true,
      },
    });

    // Para cada item en el carrito, filtrar las imágenes relacionadas
    const carritoItemsWithImages = carrito.items.map((item) => {
      const productImages = imagedata
        .filter((image) => image.producto_fk === item.producto_fk)
        .map((image) => image.url);

      return {
        productoId: item.producto_fk,
        nombre: item.producto.nombre,
        cantidad: item.cantidad,
        precio: item.producto.precioVenta,
        descripcion: item.producto.descripcion,
        path: productImages[0] || "",  // Primera imagen
        hoverPath: productImages[1] || "",  // Segunda imagen (si existe)
      };
    });

    // Responder con los datos del carrito
    res.json({
      carritoId: carrito.carrito_pk,
      total,
      items: carritoItemsWithImages,
    });
  } catch (error) {
    console.error("Error al obtener el carrito:", error);
    res.status(500).json({ error: "Error interno al obtener el carrito" });
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
    const product = await prisma.pRODUCTOS.findFirst({
      where: {
        producto_pk: Number(id),
      },
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

    if (!product) {
      res.status(404).json({ error: "Product not found" });
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
      path: productImages[0] || "",
      estado: product.estado,
      description: product.descripcion,
      price: product.precioVenta,
      hoverPath: productImages[1] || "",
      fecha_de_publicacion: publicationDate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};





export const updateProductById = async (req: Request, res: Response) => {
  const { nombre, descripcion, precioVenta, estado } = req.body;
  const { id } = req.params;

  try {
    await prismaclient.pRODUCTOS.update({
      where: {
        producto_pk: Number(id), 
      },
      data: {
        nombre: nombre, 
        precioVenta: precioVenta,
        descripcion: descripcion, 
        estado: estado,
      },
    });
    
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
  const data = await prismaclient.pRODUCTOS.delete({
    where: {
      producto_pk: Number(id),
    },
  });
  res.json(data);
};


