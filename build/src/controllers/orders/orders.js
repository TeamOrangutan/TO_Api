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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResumenOrdenes = exports.getAllOrders = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { usuarioId } = req.params;
    if (!usuarioId || isNaN(Number(usuarioId))) {
        res
            .status(400)
            .json({ error: "Faltan datos necesarios o usuarioId no válido" });
        return;
    }
    try {
        const ordenes = yield prisma.oRDENES.findMany({
            where: {
                usuario_fk: Number(usuarioId),
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                usuario: {
                    select: {
                        persona: {
                            select: {
                                nombres: true,
                                apellidos: true,
                            },
                        },
                    },
                },
                ordenItem: {
                    include: {
                        producto: true,
                        talla: true,
                    },
                },
                factura: {
                    select: {
                        factura_pk: true,
                    },
                },
            },
        });
        if (!ordenes) {
            res.status(404).json({ error: "Ordenes no encontradas" });
            return;
        }
        res.json({
            ordenes,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Error interno al obtener las ordenes" });
    }
});
exports.getAllOrders = getAllOrders;
const getResumenOrdenes = (__req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ordenes = yield prisma.oRDENES.findMany({
            include: {
                factura: true,
                usuario: {
                    select: {
                        persona: {
                            select: {
                                nombres: true,
                                apellidos: true,
                            },
                        },
                    },
                },
                ordenItem: {
                    include: {
                        producto: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        const resumen = ordenes.map((orden) => {
            var _a, _b, _c;
            const productosNombres = orden.ordenItem
                .map((item) => item.producto.nombre)
                .join(", ");
            const cantidadTotal = orden.ordenItem.reduce((sum, item) => sum + item.cantidad, 0);
            return {
                factura: (_a = orden.factura) === null || _a === void 0 ? void 0 : _a.factura_pk,
                codigo: orden.orderId,
                cliente: ((_b = orden.usuario.persona) === null || _b === void 0 ? void 0 : _b.nombres) + " " + ((_c = orden.usuario.persona) === null || _c === void 0 ? void 0 : _c.apellidos) || "Desconocido",
                productos: productosNombres,
                cantidad: cantidadTotal,
                estado: orden.estado,
                monto: `${orden.total.toFixed(2)} ${orden.moneda || "C$"}`,
                fecha: orden.createdAt,
            };
        });
        res.json({ data: resumen });
    }
    catch (error) {
        console.error("Error al obtener resumen de órdenes:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
exports.getResumenOrdenes = getResumenOrdenes;
