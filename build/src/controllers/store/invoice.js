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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvoiceById = exports.getAll = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { usuarioId } = req.params;
    try {
        const facturas = yield prisma.factura.findMany({
            where: {
                orden_fk: {
                    usuario_fk: Number(usuarioId),
                },
            },
            include: {
                orden_fk: {
                    select: {
                        usuario_fk: true,
                        usuario: true,
                    },
                },
                facItems: {
                    select: {
                        factura_item_pk: true,
                        factura_id: true,
                        orden_item_id: true,
                        orden_item_fk: {
                            select: {
                                orden_item_pk: true,
                                cantidad: true,
                                precio_unitario_usd: true,
                                subtotal_usd: true,
                                producto: {
                                    select: {
                                        producto_pk: true,
                                        nombre: true,
                                        descripcion: true,
                                        estado: true,
                                    },
                                },
                                talla: {
                                    select: {
                                        talla_pk: true,
                                        nombre: true,
                                        cantidad: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                fecha: "desc",
            },
        });
        res.status(200).json(facturas);
    }
    catch (error) {
        console.error("Error al obtener las facturas:", error);
        res.status(500).json({ message: "Error al obtener las facturas" });
    }
});
exports.getAll = getAll;
const getInvoiceById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { facturaId } = req.params;
    try {
        const facturas = yield prisma.factura.findMany({
            where: {
                factura_pk: Number(facturaId),
            },
            select: {
                factura_pk: true,
                orden_id: true,
                fecha: true,
                nombreCliente: true,
                direccion: true,
                metodoPago: true,
                total: true,
                folio: true,
                telefono: true,
                orden_fk: true,
                facItems: {
                    select: {
                        factura_item_pk: true,
                        factura_id: true,
                        orden_item_id: true,
                        orden_item_fk: {
                            select: {
                                orden_item_pk: true,
                                cantidad: true,
                                precio_unitario_usd: true,
                                subtotal_usd: true,
                                producto: {
                                    select: {
                                        producto_pk: true,
                                        nombre: true,
                                        descripcion: true,
                                        estado: true,
                                        imagenes: {
                                            select: {
                                                url: true,
                                            },
                                        },
                                    },
                                },
                                talla: {
                                    select: {
                                        talla_pk: true,
                                        nombre: true,
                                        cantidad: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                fecha: "desc",
            },
        });
        const facturasConPaths = facturas.map((factura) => (Object.assign(Object.assign({}, factura), { facItems: factura.facItems.map((item) => {
                var _a, _b;
                const imagenes = item.orden_item_fk.producto.imagenes || [];
                const path = ((_a = imagenes[0]) === null || _a === void 0 ? void 0 : _a.url) || "";
                const hoverPath = ((_b = imagenes[1]) === null || _b === void 0 ? void 0 : _b.url) || "";
                const _c = item.orden_item_fk.producto, { imagenes: _ } = _c, productoSinImagenes = __rest(_c, ["imagenes"]);
                return Object.assign(Object.assign({}, item), { orden_item_fk: Object.assign(Object.assign({}, item.orden_item_fk), { producto: Object.assign(Object.assign({}, productoSinImagenes), { path,
                            hoverPath }) }) });
            }) })));
        res.status(200).json(facturasConPaths);
    }
    catch (error) {
        console.error("Error al obtener la factura:", error);
        res.status(500).json({ message: "Error al obtener la factura" });
    }
});
exports.getInvoiceById = getInvoiceById;
// export const createInvoice = async (req: Request, res: Response) => {
//   const { productos, nombreCliente }: invoiceProps = req.body;
//   console.log(productos);
//   console.log('REQ.BODY:', req.body);
//   const productoPKs = productos.map((producto) => producto.producto_pk);
//   const newFactura = await prismaclient.fACTURA.create({
//     data: {
//       nombreCliente: nombreCliente,
//       total: 0.0,
//     },
//   });
//   const data = await prismaclient.pRODUCTOS.findMany({
//     where: {
//       producto_pk: {
//         in: productoPKs,
//       },
//     },
//     select: {
//       precioVenta: true,
//     },
//   });
//   const productoPrice = data.map((data) => Number(data.precioVenta));
//   const total = productoPrice.reduce(
//     (accumulator, currentValue, index) =>
//       accumulator +
//       currentValue * productos[productos.length - (index + 1)].cantidad,
//     0
//   );
//   const producto = productos.map((producto) => ({
//     cantidad: producto.cantidad,
//     producto_fk: producto.producto_pk,
//     factura_fk: newFactura.factura_pk,
//   }));
//   await prismaclient.fAC_PRODUCTO.createMany({
//     data: producto,
//   });
//   const fecha = new Date();
//   const Bill = await prismaclient.fACTURA.update({
//     where: {
//       factura_pk: newFactura.factura_pk,
//     },
//     data: {
//       total: total,
//       fecha: fecha.toISOString(),
//     },
//   });
//   res.send(Bill);
// };
// export const getInvoiceProducts = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const productos = await prismaclient.fAC_PRODUCTO.findMany({
//       where: {
//         factura_fk: Number(id),
//       },
//       select: {
//         cantidad: true,
//         producto: {
//           select: {
//             nombre: true,
//             precioVenta: true,
//           },
//         },
//       },
//     });
//     res.json(productos);  // Asegúrate de retornar la respuesta correctamente
//   } catch (error) {
//     res.status(500).json({ error: "Error al obtener los productos de la factura." });
//   }
// };
// export const getSales = async (_req: Request, res: Response) => {
//   try {
//     const fhoy = new Date();
//     const comienzoMes = new Date(fhoy.getFullYear(), fhoy.getMonth(), 1);
//     const comienzoMesAnterior = new Date(fhoy.getFullYear(), fhoy.getMonth() - 1, 1);
//     const sem = new Date(fhoy);
//     sem.setDate(fhoy.getDate() - fhoy.getDay());
//     const vhoy = new Date(fhoy.setHours(0, 0, 0, 0));
//     const totalVentas = await prismaclient.fACTURA.aggregate({
//       _sum: {
//         total: true,
//       },
//     });
//     const vMensuales = await prismaclient.fACTURA.aggregate({
//       _sum: {
//         total: true,
//       },
//       where: {
//         fecha: {
//           gte: comienzoMes,
//         },
//       },
//     });
//     const vMensualesAnterior = await prismaclient.fACTURA.aggregate({
//       _sum: {
//         total: true,
//       },
//       where: {
//         fecha: {
//           gte: comienzoMesAnterior,
//           lt: comienzoMes,
//         },
//       },
//     });
//     const vSem = await prismaclient.fACTURA.aggregate({
//       _sum: {
//         total: true,
//       },
//       where: {
//         fecha: {
//           gte: sem,
//         },
//       },
//     });
//     const vHoy = await prismaclient.fACTURA.aggregate({
//       _sum: {
//         total: true,
//       },
//       where: {
//         fecha: {
//           gte: vhoy,
//         },
//       },
//     });
//     // paraconvertir Decimal a number o 0 si es null
//     const toNumber = (value: Decimal | null): number => {
//       return value ? parseFloat(value.toString()) : 0;
//     };
//     // diferencia margen de ganancia/prdida
//     const diferenciaMes = toNumber(vMensuales._sum.total) - toNumber(vMensualesAnterior._sum.total);
//     const porcentajeDiferencia = toNumber(vMensualesAnterior._sum.total) !== 0
//       ? (diferenciaMes / toNumber(vMensualesAnterior._sum.total)) * 100 : 0;
//     res.json({
//       ventasTotales: totalVentas._sum.total ? totalVentas._sum.total : '00,000.00',
//       ventasMensuales: vMensuales._sum.total ? vMensuales._sum.total : '00,000.00',
//       ventasMesAnterior: vMensualesAnterior._sum.total ? vMensualesAnterior._sum.total : '00,000.00',
//       porcentajeDiferencia: `${porcentajeDiferencia.toFixed(2)}%`,
//       ventasSemana: vSem._sum.total ? vSem._sum.total : '00,000.00',
//       ventasHoy: vHoy._sum.total ? vHoy._sum.total : '00,000.00',
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error al obtener las ventas." });
//   }
// };
// export const getAllInvoices = async (_: any, res: Response): Promise<void> => {
//   try {
//     // Obtenemos todas las facturas junto con sus productos relacionados
//     const facturas = await prismaclient.fACTURA.findMany({
//       include: {
//         formaPago: true,  // Incluye la relación con la forma de pago
//         facProductos: {
//           include: {
//             producto: true,  // Incluye los productos asociados a la factura
//           },
//         },
//       },
//     });
//     // Respondemos con las facturas obtenidas
//     res.json(facturas);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error al obtener las facturas.' });
//   }
// };
