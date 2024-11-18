import { Request, Response } from "express";
import { prisma } from "../../prisma";
import { upload } from "../../utils/multer";
import { prismaclient } from "../../index";
import { params } from "../../@types/index";

export const createProduct = (req: Request, res: Response) => {
  upload.array("images", 2)(req, res, async (err) => {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }

    try {
      if (Array.isArray(req.files) && req.files.length < 2) {
        return res.status(400).json({ error: "Debes subir dos imágenes." });
      }

      const imagenes = (req.files as Express.Multer.File[]).map(
        (file) => file.path
      );

      const { nombre, precioVenta, descripcion } = req.body;

      if (!nombre || !precioVenta || !descripcion) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
      }

      const producto = await prisma.pRODUCTOS.create({
        data: {
          nombre,
          precioVenta: parseFloat(precioVenta),
          descripcion,
        },
      });

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
  const Imagedata = await prismaclient.iMAGEN.findMany({
    select: {
      producto_fk: true,
      url: true,
    },
  });

  const ProductData = await prismaclient.pRODUCTOS.findMany({
    select: {
      producto_pk: true,
      nombre: true,
      precioVenta: true,
      descripcion: true,
    },
  });

  /*
      data: 
      [
        {
          product_pk: ..
          imagen1: ...
          imagen2: ...
          nombre: ....
          fecha: ....
          
          }
      ]
  */

  res.json({ Imagedata, ProductData });
};

export const getProductById = async (_req: Request, _res: Response) => {};
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
