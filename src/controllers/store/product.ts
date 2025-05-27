import { Request, Response } from "express";
import { prisma } from "../../prisma";
import { upload } from "../../utils/multer";
import { prismaclient } from "../../index";
import Decimal from "decimal.js";

interface Talla {
  id: number;
  name: string;
  stock: number;
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
    // console.log("Headers:", req.headers); // Muestra las cabeceras de la solicitud
    // console.log("Files:", req.files); // Muestra los archivos subidos

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
        return res.status(400).json({
          error: "Solo se permiten archivos de imagen (JPG, PNG, GIF).",
        });
      }

      // Obtener las rutas de las imágenes subidas
      const imagenes = req.files.map((file: Express.Multer.File) => file.path);

      // Extraer datos del cuerpo de la solicitud
      const { nombre, precioVenta, descripcion, estado, tallas } = req.body;

      console.log("tallas");
      console.log(tallas.length);
      // Validar que los datos requeridos estén presentes
      if (
        !nombre ||
        !precioVenta ||
        !descripcion ||
        !tallas ||
        tallas.length == 2
      ) {
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
          stock: tallasRecords.reduce(
            (total: number, talla: any) => total + talla.cantidad,
            0
          ),
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
    const imagedata = await prisma.iMAGEN.findMany({
      select: {
        producto_fk: true,
        url: true,
      },
    });

    // Obtener los datos de los productos
    const productData = await prisma.pRODUCTOS.findMany({
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
        tallas: {
          select: { nombre: true }, // Seleccionamos las tallas relacionadas
        },
      },
    });

    // Mapear productos para agregar imágenes
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
        tallas: product.tallas.map((t) => t.nombre), // Agregamos las tallas
      };
    });

    res.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
};

export const addToCart = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { productId, cantidad, talla, usuarioId } = req.body;

  console.log(req.body);

  if (!productId || !usuarioId) {
    return res.status(400).json({ message: "Faltan datos necesarios" });
  }

  try {
    const producto = await prisma.pRODUCTOS.findUnique({
      where: { producto_pk: Number(productId) },
      include: { tallas: true },
    });

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const usuario = await prisma.uSUARIO.findUnique({
      where: { usuario_pk: usuarioId },
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    let carrito = await prisma.cARRITO.findUnique({
      where: { usuario_fk: usuario.usuario_pk },
    });

    if (!carrito) {
      carrito = await prisma.cARRITO.create({
        data: {
          usuario_fk: usuario.usuario_pk,
          total: new Decimal(0),
        },
      });
    }

    let tallaSeleccionada = null;
    if (talla) {
      // <- solo si mandan talla
      tallaSeleccionada = producto.tallas.find(
        (t) => t.nombre.toLowerCase() === talla.toLowerCase()
      );

      if (!tallaSeleccionada) {
        return res
          .status(404)
          .json({ message: "Talla no encontrada para este producto" });
      }
      if (tallaSeleccionada?.cantidad < cantidad) {
        return res.status(400).json({
          message: "No hay suficiente stock disponible para esta talla",
        });
      }
    }

    const totalProducto = new Decimal(cantidad).mul(
      new Decimal(producto.precioVenta)
    );

    carrito = await prisma.cARRITO.update({
      where: { carrito_pk: carrito.carrito_pk },
      data: {
        total: new Decimal(carrito.total).add(totalProducto),
      },
    });

    const carritoItem = await prisma.cARRITO_ITEM.create({
      data: {
        cantidad: Number(cantidad),
        producto_fk: Number(productId),
        carrito_fk: carrito.carrito_pk,
        talla_fk: tallaSeleccionada ? tallaSeleccionada.talla_pk : null, // <- puede ser null
      },
      include: {
        producto: true,
        talla: true,
      },
    });

    if (tallaSeleccionada) {
      await prisma.tALLA.update({
        where: { talla_pk: tallaSeleccionada.talla_pk },
        data: {
          cantidad: {
            decrement: Number(cantidad),
          },
        },
      });

      // Verifica si todas las tallas tienen cantidad 0
      const tallasDelProducto = await prisma.tALLA.findMany({
        where: { producto_fk: producto.producto_pk },
      });

      const todasAgotadas = tallasDelProducto.every((t) => t.cantidad === 0);

      if (todasAgotadas) {
        await prisma.pRODUCTOS.update({
          where: { producto_pk: producto.producto_pk },
          data: {
            estado: "Agotado",
          },
        });
      }
    }

    return res.status(200).json({
      message: "Producto agregado al carrito correctamente",
      carrito: {
        id: carrito.carrito_pk,
        total: carrito.total,
        usuario: usuarioId,
      },
      itemAgregado: {
        id: carritoItem.carritoItem_pk,
        cantidad: carritoItem.cantidad,
        talla: carritoItem.talla ? carritoItem.talla.nombre : "Sin talla",
        producto: {
          id: carritoItem.producto.producto_pk,
          nombre: carritoItem.producto.nombre,
          precio: carritoItem.producto.precioVenta,
        },
      },
    });
  } catch (error) {
    console.error("Error al agregar producto al carrito:", error);
    return res.status(500).json({
      message: "Error interno al agregar el producto al carrito",
    });
  }
};

export const getCarrito = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { usuarioId } = req.params;

  console.log("hola");

  // Validación de entrada
  if (!usuarioId || isNaN(Number(usuarioId))) {
    res
      .status(400)
      .json({ error: "Faltan datos necesarios o usuarioId no válido" });
    return;
  }

  try {
    // Buscar el carrito del usuario
    const carrito = await prisma.cARRITO.findFirst({
      where: {
        usuario_fk: Number(usuarioId),
      },
      include: {
        items: {
          include: {
            producto: true,
            talla: true, // Incluir talla si se está usando
          },
        },
      },
    });

    if (!carrito) {
      res.status(404).json({ error: "Carrito no encontrado" });
      return;
    }

    // Obtener imágenes de todos los productos
    const imagenes = await prisma.iMAGEN.findMany({
      select: {
        producto_fk: true,
        url: true,
      },
    });

    // Armar los items con imagen y detalles
    const itemsConDetalles = carrito.items.map((item) => {
      const imagenesProducto = imagenes.filter(
        (img) => img.producto_fk === item.producto_fk
      );
      return {
        carritoItem_Id: item.carritoItem_pk,
        productoId: item.producto_fk,
        nombre: item.producto.nombre,
        descripcion: item.producto.descripcion,
        precio: item.producto.precioVenta,
        cantidad: item.cantidad,
        talla: item.talla?.nombre || null,
        path: imagenesProducto[0]?.url || "",
        hoverPath: imagenesProducto[1]?.url || "",
      };
    });

    // Calcular total
    const total = carrito.items.reduce(
      (acc, item) => acc + Number(item.producto.precioVenta) * item.cantidad,
      0
    );

    // Respuesta
    res.json({
      carritoId: carrito.carrito_pk,
      total,
      items: itemsConDetalles,
    });
  } catch (error) {
    console.error("Error al obtener el carrito:", error);
    res.status(500).json({ error: "Error interno al obtener el carrito" });
  }
};

export const updateItemCarrito = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { itemId, talla, cantidad, action } = req.body;

  console.log("entrando");
  console.log(cantidad);
  console.log(talla);
  console.log(action);

  if (!itemId || !action) {
    return res.status(400).json({ message: "Faltan datos necesarios" });
  }

  if (!["increment", "decrement"].includes(action)) {
    return res.status(400).json({ message: "Acción no válida" });
  }

  try {
    const item = await prisma.cARRITO_ITEM.findUnique({
      where: { carritoItem_pk: Number(itemId) },
      include: {
        producto: { include: { tallas: true } },
        talla: true,
        carrito: true,
      },
    });

    if (!item) {
      return res
        .status(404)
        .json({ message: "Item del carrito no encontrado" });
    }

    const producto = item.producto;
    const carrito = item.carrito;

    if (producto.estado.toLowerCase() === "agotado") {
      return res.status(400).json({ message: "El producto está agotado" });
    }

    // Buscar talla (puede ser la misma o distinta)
    const nuevaTalla = talla
      ? producto.tallas.find(
          (t) => t.nombre.toLowerCase() === talla.toLowerCase()
        )
      : item.talla;

    console.log("nuevaTalla?.cantidad");
    console.log(nuevaTalla?.cantidad);

    console.log(item.cantidad);

    if (!nuevaTalla) {
      return res.status(404).json({ message: "Talla no encontrada" });
    }

    const precioUnitario = new Decimal(producto.precioVenta);
    const diferenciaTotal = precioUnitario.mul(cantidad);

    if (action === "increment") {
      if (nuevaTalla?.cantidad === 0) {
        return res.status(400).json({ message: "Esta talla está agotada" });
      }

      if (nuevaTalla.cantidad < cantidad) {
        return res.status(400).json({ message: "Stock insuficiente" });
      }

      // 1. Actualizar stock: RESTAR cantidad
      await prisma.tALLA.update({
        where: { talla_pk: nuevaTalla.talla_pk },
        data: {
          cantidad: { decrement: cantidad },
        },
      });

      // 2. Actualizar carrito item: SUMAR cantidad
      const itemActualizado = await prisma.cARRITO_ITEM.update({
        where: { carritoItem_pk: Number(itemId) },
        data: {
          cantidad: { increment: cantidad },
          talla_fk: nuevaTalla.talla_pk,
        },
        include: { producto: true, talla: true },
      });

      // 3. Actualizar total del carrito
      await prisma.cARRITO.update({
        where: { carrito_pk: carrito.carrito_pk },
        data: {
          total: new Decimal(carrito.total).add(diferenciaTotal),
        },
      });

      return res.status(200).json({
        message: "Cantidad incrementada",
        itemActualizado,
      });
    } else {
      // 1. Actualizar stock: SUMAR cantidad
      await prisma.tALLA.update({
        where: { talla_pk: nuevaTalla.talla_pk },
        data: {
          cantidad: { increment: cantidad },
        },
      });

      console.log(item.cantidad);
      console.log(cantidad);

      let nuevaCantidad = item.cantidad - cantidad;
      if (nuevaCantidad < 0) {
        nuevaCantidad = 0;
      }

      console.log("nueva cantidad");
      console.log(nuevaCantidad);
      

        // 2. Actualizar carrito item: RESTAR cantidad
        const itemActualizado = await prisma.cARRITO_ITEM.update({
          where: { carritoItem_pk: Number(itemId) },
          data: {
            cantidad: nuevaCantidad,
            talla_fk: nuevaTalla.talla_pk,
          },
          include: { producto: true, talla: true },
        });

        // 3. Actualizar total del carrito
        await prisma.cARRITO.update({
          where: { carrito_pk: carrito.carrito_pk },
          data: {
            total: new Decimal(carrito.total).sub(diferenciaTotal),
          },
        });
        return res.status(200).json({
          message: "Cantidad reducida",
          itemActualizado,
        });
      
      return res.status(400).json({ message: "Stock insuficiente" });
    }
  } catch (error) {
    console.error("Error al actualizar item del carrito:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const deleteItemCarrito = async (req: Request, res: Response) => {
  const { carritoId, carritoItemId } = req.params;

  try {
    // Verificar si el carrito existe
    const carrito = await prisma.cARRITO.findUnique({
      where: {
        carrito_pk: parseInt(carritoId),
      },
      include: { items: true },
    });

    if (!carrito) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }

    // Verificar si el ítem existe dentro del carrito
    const carritoItem = await prisma.cARRITO_ITEM.findUnique({
      where: {
        carritoItem_pk: parseInt(carritoItemId),
      },
      include: {
        producto: true,
        talla: true,
      },
    });

    if (!carritoItem || carritoItem.carrito_fk !== parseInt(carritoId)) {
      return res
        .status(404)
        .json({ message: "Ítem no encontrado en este carrito" });
    }

    if (carritoItem.talla_fk) {
      await prisma.tALLA.update({
        where: { talla_pk: carritoItem.talla_fk },
        data: {
          cantidad: {
            increment: carritoItem.cantidad,
          },
        },
      });
    }

    const productoActualizado = await prisma.pRODUCTOS.findUnique({
      where: { producto_pk: carritoItem.producto_fk },
      include: { tallas: true },
    });

    const algunaTallaDisponible = productoActualizado?.tallas.some(
      (t) => t.cantidad > 0
    );

    if (productoActualizado?.estado === "Agotado" && algunaTallaDisponible) {
      await prisma.pRODUCTOS.update({
        where: { producto_pk: carritoItem.producto_fk },
        data: {
          estado: "Disponible",
        },
      });
    }

    // Eliminar el ítem
    await prisma.cARRITO_ITEM.delete({
      where: {
        carritoItem_pk: parseInt(carritoItemId),
      },
    });

    // Recalcular el total del carrito
    const updatedItems = await prisma.cARRITO_ITEM.findMany({
      where: {
        carrito_fk: parseInt(carritoId),
      },
      include: {
        producto: true,
      },
    });

    const newTotal = updatedItems.reduce((sum, item) => {
      return (
        sum + parseFloat(item.producto.precioVenta.toString()) * item.cantidad
      );
    }, 0);

    // Actualizar el total del carrito
    await prisma.cARRITO.update({
      where: {
        carrito_pk: parseInt(carritoId),
      },
      data: {
        total: newTotal,
      },
    });

    // Respuesta exitosa
    return res.json({
      message: "Ítem eliminado correctamente",
      newTotal,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error al eliminar el ítem del carrito" });
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
    // Obtener datos del producto
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
        tallas: {
          select: {
            talla_pk: true,
            nombre: true,
            cantidad: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Obtener imágenes del producto
    const imagedata = await prisma.iMAGEN.findMany({
      where: {
        producto_fk: Number(id),
      },
      select: {
        url: true,
      },
    });

    const productImages = imagedata.map((image) => image.url);

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
      tallas: product.tallas.map((talla) => ({
        id: talla.talla_pk,
        name: talla.nombre,
        stock: talla.cantidad,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateProductById = async (req: Request, res: Response) => {
  const { nombre, descripcion, precioVenta, estado, tallas } = req.body;
  const { id } = req.params;

  console.log("Datos recibidos:", req.body);
  console.log("Imágenes recibidas:", req.files); // Aquí tienes el array de imágenes
  const imagenesAntiguas = JSON.parse(req.body.imagenesAntiguas); // Llega como string

  console.log("imagenesAntiguas");
  console.log(imagenesAntiguas);

  // Comprobar si req.files es un array de archivos y mapear las rutas de las imágenes
  const imagenes = Array.isArray(req.files)
    ? (req.files as Express.Multer.File[]).map(
        (file) => `uploads/${file.filename}`
      )
    : [];

  console.log("Imágenes procesadas:");
  console.log(JSON.parse(tallas));
  const tallasP = JSON.parse(tallas);
  if (tallasP) {
    tallasP.map((talla: Talla) => {
      console.log("Talla id:", talla.id);
      console.log("Talla name:", talla.name);
      console.log("Talla stock:", talla.stock);
    });
  } else {
    console.log("tallas no es un array:", tallas);
  }

  try {
    const productoId = Number(id);

    // 1. Actualizar los datos principales del producto
    await prismaclient.pRODUCTOS.update({
      where: { producto_pk: productoId },
      data: {
        nombre,
        precioVenta,
        descripcion,
        estado,
      },
    });

    // 2. Eliminar tallas anteriores
    await prismaclient.tALLA.deleteMany({
      where: { producto_fk: productoId },
    });

    // 3. Insertar nuevas tallas

    for (const talla of tallasP) {
      await prismaclient.tALLA.create({
        data: {
          nombre: talla.name,
          cantidad: talla.stock,
          producto_fk: productoId,
        },
      });
    }

    // 4. Eliminar todas las imágenes anteriores
    await prismaclient.iMAGEN.deleteMany({
      where: {
        producto_fk: productoId,
      },
    });
    console.log("Imágenes anteriores eliminadas");

    // 5. Insertar las imágenes antiguas (si las hay) y las nuevas
    const imagenesFinales = imagenesAntiguas.concat(imagenes); // Combina las imágenes antiguas con las nuevas
    if (imagenesFinales.length > 0) {
      for (const url of imagenesFinales) {
        await prismaclient.iMAGEN.create({
          data: {
            url,
            producto_fk: productoId,
          },
        });
      }
      console.log("Imágenes actualizadas (nuevas y antiguas)");
    }

    res.status(200).json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ error: "Error interno al actualizar el producto" });
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
