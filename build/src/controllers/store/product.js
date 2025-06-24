"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResumenInventario = exports.deleteProductById = exports.updateProductById = exports.getProductById = exports.deleteItemCarrito = exports.updateItemCarrito = exports.getCarrito = exports.addToCart = exports.getProducts = exports.createProduct = void 0;
const prisma_1 = require("../../prisma");
const multer_1 = require("../../utils/multer");
const index_1 = require("../../index");
const decimal_js_1 = __importDefault(require("decimal.js"));
const supabaseClient_1 = __importDefault(require("../../utils/supabaseClient"));
const createProduct = (req, res) => {
    // Middleware de multer para manejar múltiples imágenes (máximo 10)
    multer_1.upload.array("images", 10)(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
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
            const validTypes = ["image/jpeg", "image/png", "image/gif"];
            const files = req.files;
            const imagenesUrls = [];
            for (const file of files) {
                if (!validTypes.includes(file.mimetype)) {
                    return res
                        .status(400)
                        .json({ error: "Archivo no es una imagen válida." });
                }
                const fileName = `${Date.now()}-${file.originalname}`;
                const filePath = `/${fileName}`;
                const { error: uploadError } = yield supabaseClient_1.default.storage
                    .from("products")
                    .upload(filePath, file.buffer, { contentType: file.mimetype });
                if (uploadError) {
                    console.error("Error en upload a Supabase:", uploadError);
                    return res.status(500).json({ error: "Error al subir imagen." });
                }
                const { data } = supabaseClient_1.default.storage
                    .from("products")
                    .getPublicUrl(filePath);
                console.log(data);
                imagenesUrls.push(data.publicUrl);
            }
            // Extraer datos del cuerpo de la solicitud
            const { nombre, precioVenta, descripcion, estado, tallas } = req.body;
            console.log("tallas");
            console.log(tallas.length);
            // Validar que los datos requeridos estén presentes
            if (!nombre ||
                !precioVenta ||
                !descripcion ||
                !tallas ||
                tallas.length == 2) {
                return res.status(400).json({ error: "Faltan datos requeridos." });
            }
            let tallasData;
            try {
                tallasData = JSON.parse(tallas);
            }
            catch (error) {
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
                if (!talla.name || !talla.stock) {
                    return res
                        .status(400)
                        .json({ error: "Cada talla debe tener un nombre y una cantidad." });
                }
            }
            // Crear el producto en la base de datos
            const producto = yield prisma_1.prisma.pRODUCTOS.create({
                data: {
                    nombre,
                    precioVenta: parseFloat(precioVenta),
                    descripcion,
                    estado: estado || "disponible", // Estado por defecto
                },
            });
            // Procesar las tallas
            const tallasRecords = tallasData.map((talla) => ({
                nombre: talla.name,
                cantidad: talla.stock,
                producto_fk: producto.producto_pk,
            }));
            // Crear las tallas asociadas al producto
            yield prisma_1.prisma.tALLA.createMany({
                data: tallasRecords,
            });
            // Registrar en INVENTARIO con los datos iniciales
            yield prisma_1.prisma.iNVENTARIO.create({
                data: {
                    precioCompra: 0, // Suponiendo que no tienes un precio de compra al crear
                    stock: tallasRecords.reduce((total, talla) => total + talla.cantidad, 0),
                    producto_fk: producto.producto_pk,
                },
            });
            // Registrar las imágenes asociadas al producto
            yield prisma_1.prisma.iMAGEN.createMany({
                data: imagenesUrls.map((url) => ({
                    url,
                    producto_fk: producto.producto_pk,
                })),
            });
            // Registrar el producto en la tabla REGISTRO
            yield prisma_1.prisma.rEGISTRO.create({
                data: {
                    producto_fk: producto.producto_pk,
                    fecha: new Date(),
                },
            });
            // Obtener las tallas asociadas al producto
            const tallasRegistradas = yield prisma_1.prisma.tALLA.findMany({
                where: { producto_fk: producto.producto_pk },
            });
            // Enviar la respuesta exitosa
            return res.status(201).json({
                message: "Producto creado con éxito",
                data: Object.assign(Object.assign({}, producto), { tallas: tallasRegistradas }),
                imagenesUrls, // Incluir las imágenes asociadas al producto
            });
        }
        catch (error) {
            console.error("Error al crear producto:", error);
            return res
                .status(500)
                .json({ error: "Error interno al crear el producto." });
        }
    }));
};
exports.createProduct = createProduct;
const getProducts = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Obtener datos de las imágenes
        const imagedata = yield prisma_1.prisma.iMAGEN.findMany({
            select: {
                producto_fk: true,
                url: true,
            },
        });
        // Obtener los datos de los productos
        const productData = yield prisma_1.prisma.pRODUCTOS.findMany({
            select: {
                producto_pk: true,
                nombre: true,
                precioVenta: true,
                precioFabricacion: true,
                descripcion: true,
                estado: true,
                registros: {
                    select: {
                        fecha: true,
                    },
                },
                tallas: {
                    select: { nombre: true, cantidad: true }, // Seleccionamos las tallas relacionadas
                },
            },
        });
        // Mapear productos para agregar imágenes
        const products = productData.map((product) => {
            const productImages = imagedata
                .filter((image) => image.producto_fk === product.producto_pk)
                .map((image) => image.url);
            const publicationDate = product.registros.length > 0 ? product.registros[0].fecha : null;
            return {
                id: product.producto_pk,
                name: product.nombre,
                path: productImages[0] || "",
                estado: product.estado,
                description: product.descripcion,
                price: product.precioVenta,
                precioFabricacion: product.precioFabricacion,
                hoverPath: productImages[1] || "",
                fecha_de_publicacion: publicationDate,
                tallas: product.tallas.map((t) => t.nombre), // Agregamos las tallas
            };
        });
        res.json(products);
    }
    catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error al obtener los productos" });
    }
});
exports.getProducts = getProducts;
const addToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, cantidad, talla, usuarioId } = req.body;
    console.log(req.body);
    if (!productId || !usuarioId) {
        return res.status(400).json({ message: "Faltan datos necesarios" });
    }
    try {
        const producto = yield prisma_1.prisma.pRODUCTOS.findUnique({
            where: { producto_pk: Number(productId) },
            include: { tallas: true },
        });
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        const usuario = yield prisma_1.prisma.uSUARIO.findUnique({
            where: { usuario_pk: usuarioId },
        });
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        let carrito = yield prisma_1.prisma.cARRITO.findUnique({
            where: { usuario_fk: usuario.usuario_pk },
        });
        if (!carrito) {
            carrito = yield prisma_1.prisma.cARRITO.create({
                data: {
                    usuario_fk: usuario.usuario_pk,
                    total: new decimal_js_1.default(0),
                },
            });
        }
        let tallaSeleccionada = null;
        if (talla) {
            tallaSeleccionada = producto.tallas.find((t) => t.nombre.toLowerCase() === talla.toLowerCase());
            if (!tallaSeleccionada) {
                return res
                    .status(404)
                    .json({ message: "Talla no encontrada para este producto" });
            }
        }
        // Busca si ya existe ese producto/talla en el carrito
        let carritoItemExistente = yield prisma_1.prisma.cARRITO_ITEM.findFirst({
            where: {
                carrito_fk: carrito.carrito_pk,
                producto_fk: Number(productId),
                talla_fk: tallaSeleccionada ? tallaSeleccionada.talla_pk : null,
            },
        });
        let nuevaCantidad = Number(cantidad);
        if (carritoItemExistente) {
            nuevaCantidad = carritoItemExistente.cantidad + Number(cantidad);
        }
        // Valida stock sumando cantidades
        if (tallaSeleccionada && nuevaCantidad > tallaSeleccionada.cantidad) {
            return res.status(400).json({
                message: "No hay suficiente stock disponible para esta talla",
            });
        }
        const totalProducto = new decimal_js_1.default(cantidad).mul(new decimal_js_1.default(producto.precioVenta));
        carrito = yield prisma_1.prisma.cARRITO.update({
            where: { carrito_pk: carrito.carrito_pk },
            data: {
                total: new decimal_js_1.default(carrito.total).add(totalProducto),
            },
        });
        let carritoItem;
        if (carritoItemExistente) {
            // Suma la cantidad al existente
            carritoItem = yield prisma_1.prisma.cARRITO_ITEM.update({
                where: { carritoItem_pk: carritoItemExistente.carritoItem_pk },
                data: {
                    cantidad: nuevaCantidad,
                },
                include: {
                    producto: true,
                    talla: true,
                },
            });
        }
        else {
            // Si no existe, crea el ítem normalmente
            carritoItem = yield prisma_1.prisma.cARRITO_ITEM.create({
                data: {
                    cantidad: Number(cantidad),
                    producto_fk: Number(productId),
                    carrito_fk: carrito.carrito_pk,
                    talla_fk: tallaSeleccionada ? tallaSeleccionada.talla_pk : null,
                },
                include: {
                    producto: true,
                    talla: true,
                },
            });
        }
        if (tallaSeleccionada) {
            // Verifica si todas las tallas tienen cantidad 0
            const tallasDelProducto = yield prisma_1.prisma.tALLA.findMany({
                where: { producto_fk: producto.producto_pk },
            });
            const todasAgotadas = tallasDelProducto.every((t) => t.cantidad === 0);
            if (todasAgotadas) {
                yield prisma_1.prisma.pRODUCTOS.update({
                    where: { producto_pk: producto.producto_pk },
                    data: {
                        estado: "Agotado",
                    },
                });
            }
        }
        return res.status(200).json({
            message: carritoItemExistente
                ? "Cantidad actualizada en el carrito correctamente"
                : "Producto agregado al carrito correctamente",
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
    }
    catch (error) {
        console.error("Error al agregar producto al carrito:", error);
        return res.status(500).json({
            message: "Error interno al agregar el producto al carrito",
        });
    }
});
exports.addToCart = addToCart;
const getCarrito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const carrito = yield prisma_1.prisma.cARRITO.findFirst({
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
        const imagenes = yield prisma_1.prisma.iMAGEN.findMany({
            select: {
                producto_fk: true,
                url: true,
            },
        });
        // Armar los items con imagen y detalles
        const itemsConDetalles = carrito.items.map((item) => {
            var _a, _b, _c;
            const imagenesProducto = imagenes.filter((img) => img.producto_fk === item.producto_fk);
            return {
                carritoItem_Id: item.carritoItem_pk,
                productoId: item.producto_fk,
                nombre: item.producto.nombre,
                descripcion: item.producto.descripcion,
                precio: item.producto.precioVenta,
                cantidad: item.cantidad,
                talla: ((_a = item.talla) === null || _a === void 0 ? void 0 : _a.nombre) || null,
                path: ((_b = imagenesProducto[0]) === null || _b === void 0 ? void 0 : _b.url) || "",
                hoverPath: ((_c = imagenesProducto[1]) === null || _c === void 0 ? void 0 : _c.url) || "",
            };
        });
        // Calcular total
        const total = carrito.items.reduce((acc, item) => acc + Number(item.producto.precioVenta) * item.cantidad, 0);
        // Respuesta
        res.json({
            carritoId: carrito.carrito_pk,
            total,
            items: itemsConDetalles,
        });
    }
    catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).json({ error: "Error interno al obtener el carrito" });
    }
});
exports.getCarrito = getCarrito;
const updateItemCarrito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemId, talla, cantidad, action } = req.body;
    console.log("entrando");
    console.log(cantidad);
    console.log(talla);
    console.log(action);
    console.log(itemId);
    if (!itemId || !action) {
        return res.status(400).json({ message: "Faltan datos necesarios" });
    }
    if (!["increment", "decrement"].includes(action)) {
        return res.status(400).json({ message: "Acción no válida" });
    }
    try {
        const item = yield prisma_1.prisma.cARRITO_ITEM.findUnique({
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
            ? producto.tallas.find((t) => t.nombre.toLowerCase() === talla.toLowerCase())
            : item.talla;
        console.log("nuevaTalla?.cantidad");
        console.log(nuevaTalla === null || nuevaTalla === void 0 ? void 0 : nuevaTalla.cantidad);
        console.log(item.cantidad);
        if (!nuevaTalla) {
            return res.status(404).json({ message: "Talla no encontrada" });
        }
        const precioUnitario = new decimal_js_1.default(producto.precioVenta);
        const diferenciaTotal = precioUnitario.mul(cantidad);
        if (action === "increment") {
            if ((nuevaTalla === null || nuevaTalla === void 0 ? void 0 : nuevaTalla.cantidad) === 0) {
                return res.status(400).json({ message: "Esta talla está agotada" });
            }
            if (nuevaTalla.cantidad < cantidad) {
                return res.status(400).json({ message: "Stock insuficiente" });
            }
            // if (finalize) {
            //   // 1. Actualizar stock: RESTAR cantidad
            //   await prisma.tALLA.update({
            //     where: { talla_pk: nuevaTalla.talla_pk },
            //     data: {
            //       cantidad: { decrement: cantidad },
            //     },
            //   });
            // }
            // 2. Actualizar carrito item: SUMAR cantidad
            const itemActualizado = yield prisma_1.prisma.cARRITO_ITEM.update({
                where: { carritoItem_pk: Number(itemId) },
                data: {
                    cantidad: { increment: cantidad },
                    talla_fk: nuevaTalla.talla_pk,
                },
                include: { producto: true, talla: true },
            });
            // 3. Actualizar total del carrito
            yield prisma_1.prisma.cARRITO.update({
                where: { carrito_pk: carrito.carrito_pk },
                data: {
                    total: new decimal_js_1.default(carrito.total).add(diferenciaTotal),
                },
            });
            return res.status(200).json({
                message: "Cantidad incrementada",
                itemActualizado,
            });
        }
        else {
            // if (finalize) {
            //   // 1. Actualizar stock: SUMAR cantidad
            //   await prisma.tALLA.update({
            //     where: { talla_pk: nuevaTalla.talla_pk },
            //     data: {
            //       cantidad: { increment: cantidad },
            //     },
            //   });
            // }
            console.log(item.cantidad);
            console.log(cantidad);
            let nuevaCantidad = item.cantidad - cantidad;
            if (nuevaCantidad < 0) {
                nuevaCantidad = 0;
            }
            console.log("nueva cantidad");
            console.log(nuevaCantidad);
            // 2. Actualizar carrito item: RESTAR cantidad
            const itemActualizado = yield prisma_1.prisma.cARRITO_ITEM.update({
                where: { carritoItem_pk: Number(itemId) },
                data: {
                    cantidad: nuevaCantidad,
                    talla_fk: nuevaTalla.talla_pk,
                },
                include: { producto: true, talla: true },
            });
            // 3. Actualizar total del carrito
            yield prisma_1.prisma.cARRITO.update({
                where: { carrito_pk: carrito.carrito_pk },
                data: {
                    total: new decimal_js_1.default(carrito.total).sub(diferenciaTotal),
                },
            });
            return res.status(200).json({
                message: "Cantidad reducida",
                itemActualizado,
            });
            return res.status(400).json({ message: "Stock insuficiente" });
        }
    }
    catch (error) {
        console.error("Error al actualizar item del carrito:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});
exports.updateItemCarrito = updateItemCarrito;
const deleteItemCarrito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { carritoId, carritoItemId } = req.params;
    try {
        // Verificar si el carrito existe
        const carrito = yield prisma_1.prisma.cARRITO.findUnique({
            where: {
                carrito_pk: parseInt(carritoId),
            },
            include: { items: true },
        });
        if (!carrito) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }
        // Verificar si el ítem existe dentro del carrito
        const carritoItem = yield prisma_1.prisma.cARRITO_ITEM.findUnique({
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
        const productoActualizado = yield prisma_1.prisma.pRODUCTOS.findUnique({
            where: { producto_pk: carritoItem.producto_fk },
            include: { tallas: true },
        });
        const algunaTallaDisponible = productoActualizado === null || productoActualizado === void 0 ? void 0 : productoActualizado.tallas.some((t) => t.cantidad > 0);
        if ((productoActualizado === null || productoActualizado === void 0 ? void 0 : productoActualizado.estado) === "Agotado" && algunaTallaDisponible) {
            yield prisma_1.prisma.pRODUCTOS.update({
                where: { producto_pk: carritoItem.producto_fk },
                data: {
                    estado: "Disponible",
                },
            });
        }
        // Eliminar el ítem
        yield prisma_1.prisma.cARRITO_ITEM.delete({
            where: {
                carritoItem_pk: parseInt(carritoItemId),
            },
        });
        // Recalcular el total del carrito
        const updatedItems = yield prisma_1.prisma.cARRITO_ITEM.findMany({
            where: {
                carrito_fk: parseInt(carritoId),
            },
            include: {
                producto: true,
            },
        });
        const newTotal = updatedItems.reduce((sum, item) => {
            return (sum + parseFloat(item.producto.precioVenta.toString()) * item.cantidad);
        }, 0);
        // Actualizar el total del carrito
        yield prisma_1.prisma.cARRITO.update({
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
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "Error al eliminar el ítem del carrito" });
    }
});
exports.deleteItemCarrito = deleteItemCarrito;
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
        res.status(400).json({ error: "Invalid ID" });
        return;
    }
    try {
        // Obtener datos del producto
        const product = yield prisma_1.prisma.pRODUCTOS.findFirst({
            where: {
                producto_pk: Number(id),
            },
            select: {
                producto_pk: true,
                nombre: true,
                precioVenta: true,
                precioFabricacion: true,
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
        const imagedata = yield prisma_1.prisma.iMAGEN.findMany({
            where: {
                producto_fk: Number(id),
            },
            select: {
                url: true,
            },
        });
        const productImages = imagedata.map((image) => image.url);
        const publicationDate = product.registros.length > 0 ? product.registros[0].fecha : null;
        res.json({
            id: product.producto_pk,
            name: product.nombre,
            path: productImages[0] || "",
            estado: product.estado,
            description: product.descripcion,
            price: product.precioVenta,
            precioFabricacion: product.precioFabricacion,
            hoverPath: productImages[1] || "",
            fecha_de_publicacion: publicationDate,
            tallas: product.tallas.map((talla) => ({
                id: talla.talla_pk,
                name: talla.nombre,
                stock: talla.cantidad,
            })),
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getProductById = getProductById;
const updateProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, descripcion, precioVenta, precioFabricacion, tallas, estado, } = req.body;
    const { id } = req.params;
    const imagenesAntiguas = JSON.parse(req.body.imagenesAntiguas);
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const files = req.files || [];
    const imagenesUrls = [];
    if (files.length > 0) {
        for (const file of files) {
            if (!validTypes.includes(file.mimetype)) {
                return res
                    .status(400)
                    .json({ error: "Archivo no es una imagen válida." });
            }
            const fileName = `${Date.now()}-${file.originalname}`;
            const filePath = `/${fileName}`;
            const { error: uploadError } = yield supabaseClient_1.default.storage
                .from("products")
                .upload(filePath, file.buffer, { contentType: file.mimetype });
            if (uploadError) {
                console.error("Error en upload a Supabase:", uploadError);
                return res.status(500).json({ error: "Error al subir imagen." });
            }
            const { data } = supabaseClient_1.default.storage.from("products").getPublicUrl(filePath);
            imagenesUrls.push(data.publicUrl);
        }
    }
    const tallasP = JSON.parse(tallas);
    try {
        const productoId = Number(id);
        yield index_1.prismaclient.pRODUCTOS.update({
            where: { producto_pk: productoId },
            data: {
                nombre,
                precioVenta,
                precioFabricacion,
                descripcion,
                estado,
            },
        });
        yield index_1.prismaclient.tALLA.deleteMany({
            where: { producto_fk: productoId },
        });
        for (const talla of tallasP) {
            yield index_1.prismaclient.tALLA.create({
                data: {
                    nombre: talla.name,
                    cantidad: talla.stock,
                    producto_fk: productoId,
                },
            });
        }
        yield index_1.prismaclient.iMAGEN.deleteMany({
            where: {
                producto_fk: productoId,
            },
        });
        console.log("Imágenes anteriores eliminadas");
        const imagenesFinales = imagenesAntiguas.concat(imagenesUrls); // Combina las imágenes antiguas con las nuevas
        if (imagenesFinales.length > 0) {
            for (const url of imagenesFinales) {
                yield index_1.prismaclient.iMAGEN.create({
                    data: {
                        url,
                        producto_fk: productoId,
                    },
                });
            }
            console.log("Imágenes actualizadas (nuevas y antiguas)");
        }
        return res
            .status(200)
            .json({ message: "Producto actualizado correctamente" });
    }
    catch (error) {
        console.error("Error al actualizar el producto:", error);
        return res
            .status(500)
            .json({ error: "Error interno al actualizar el producto" });
    }
});
exports.updateProductById = updateProductById;
const deleteProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const data = yield index_1.prismaclient.pRODUCTOS.update({
        where: {
            producto_pk: Number(id),
        },
        data: {
            estado: "Agotado",
        },
    });
    res.json(data);
});
exports.deleteProductById = deleteProductById;
const getResumenInventario = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalProductos = yield prisma_1.prisma.pRODUCTOS.count();
        const disponibles = yield prisma_1.prisma.pRODUCTOS.count({
            where: { estado: "Disponible" },
        });
        const agotados = yield prisma_1.prisma.pRODUCTOS.count({
            where: { estado: "Agotado" },
        });
        res.json({
            totalProductos,
            disponibles,
            agotados,
        });
    }
    catch (error) {
        console.error("Error al obtener resumen de inventario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
exports.getResumenInventario = getResumenInventario;
