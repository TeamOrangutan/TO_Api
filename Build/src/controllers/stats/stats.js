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
exports.generarReporteQuincenal = exports.ventasEstadisticas = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const ventasEstadisticas = (__req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const hoy = new Date();
        const ventasDiariasRaw = yield prisma.oRDENES.groupBy({
            by: ["createdAt"],
            _sum: { total: true },
            _count: { orden_pk: true },
            orderBy: { createdAt: "asc" },
            where: {
                createdAt: {
                    gte: new Date(hoy.setDate(hoy.getDate() - 30)),
                },
            },
        });
        const ventasDiarias = {};
        ventasDiariasRaw.forEach((v) => {
            var _a;
            const fecha = new Date(v.createdAt).toISOString().split("T")[0];
            if (!ventasDiarias[fecha])
                ventasDiarias[fecha] = { total: 0, ordenes: 0 };
            ventasDiarias[fecha].total += Number((_a = v._sum.total) !== null && _a !== void 0 ? _a : 0);
            ventasDiarias[fecha].ordenes += v._count.orden_pk;
        });
        const resultadoDiario = Object.entries(ventasDiarias).map(([fecha, datos]) => ({
            fecha,
            total: datos.total,
            ordenes: datos.ordenes,
        }));
        const totalDiario = resultadoDiario.reduce((acc, curr) => acc + curr.total, 0);
        const ventasUltimos28Dias = yield prisma.oRDENES.findMany({
            where: {
                createdAt: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 28)),
                },
            },
            select: {
                createdAt: true,
                total: true,
            },
        });
        function getYearWeek(date) {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
            return `${d.getUTCFullYear()}-W${weekNum.toString().padStart(2, "0")}`;
        }
        const ventasSemanales = {};
        ventasUltimos28Dias.forEach((venta) => {
            var _a;
            const key = getYearWeek(new Date(venta.createdAt));
            if (!ventasSemanales[key])
                ventasSemanales[key] = { total: 0, ordenes: 0 };
            ventasSemanales[key].total += Number((_a = venta.total) !== null && _a !== void 0 ? _a : 0);
            ventasSemanales[key].ordenes += 1;
        });
        const resultadoSemanal = Object.entries(ventasSemanales)
            .map(([semana, datos]) => ({
            semana,
            total: datos.total,
            ordenes: datos.ordenes,
        }))
            .sort((a, b) => (a.semana > b.semana ? 1 : -1));
        const totalSemanal = resultadoSemanal.reduce((acc, curr) => acc + curr.total, 0);
        const ventasUltimos12Meses = yield prisma.oRDENES.findMany({
            where: {
                createdAt: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
                },
            },
            select: {
                createdAt: true,
                total: true,
            },
        });
        const ventasMensuales = {};
        ventasUltimos12Meses.forEach((venta) => {
            var _a;
            const d = new Date(venta.createdAt);
            const mes = `${d.getFullYear()}-${(d.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`;
            if (!ventasMensuales[mes])
                ventasMensuales[mes] = { total: 0, ordenes: 0 };
            ventasMensuales[mes].total += Number((_a = venta.total) !== null && _a !== void 0 ? _a : 0);
            ventasMensuales[mes].ordenes += 1;
        });
        const resultadoMensual = Object.entries(ventasMensuales)
            .map(([mes, datos]) => ({
            mes,
            total: datos.total,
            ordenes: datos.ordenes,
        }))
            .sort((a, b) => (a.mes > b.mes ? 1 : -1));
        const totalMensual = resultadoMensual.reduce((acc, curr) => acc + curr.total, 0);
        const ventasTotales = yield prisma.oRDENES.aggregate({
            _sum: {
                total: true,
            },
        });
        res.status(200).json({
            ok: true,
            data: {
                ventasDiarias: resultadoDiario,
                totalDiario,
                ventasSemanales: resultadoSemanal,
                totalSemanal,
                ventasMensuales: resultadoMensual,
                totalMensual,
                ventasTotales: (_a = ventasTotales._sum.total) !== null && _a !== void 0 ? _a : 0,
            },
        });
    }
    catch (error) {
        console.error("Error al obtener estadísticas de ventas:", error);
        res.status(500).json({
            ok: false,
            message: "Error al obtener estadísticas de ventas.",
        });
    }
});
exports.ventasEstadisticas = ventasEstadisticas;
const generarReporteQuincenal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { usuario_fk } = req.body;
        if (!usuario_fk) {
            return res.status(400).json({
                message: "Usuario es requerido.",
            });
        }
        const hastaFecha = new Date();
        const desdeFecha = new Date(hastaFecha);
        desdeFecha.setDate(hastaFecha.getDate() - 14);
        const desdeStr = desdeFecha.toISOString().slice(0, 10);
        const hastaStr = hastaFecha.toISOString().slice(0, 10);
        const reporteExistente = yield prisma.rEPORTE_QUINCENAL.findFirst({
            where: {
                desde: {
                    gte: new Date(desdeStr + "T00:00:00.000Z"),
                    lte: new Date(desdeStr + "T23:59:59.999Z"),
                },
                hasta: {
                    gte: new Date(hastaStr + "T00:00:00.000Z"),
                    lte: new Date(hastaStr + "T23:59:59.999Z"),
                },
            },
            include: {
                ventasDiarias: true,
                productosAnalisis: true,
            },
        });
        if (reporteExistente) {
            return res.status(200).json(reporteExistente);
        }
        ///Total de ventas
        const ordenes = yield prisma.oRDENES.findMany({
            where: {
                createdAt: {
                    gte: desdeFecha,
                    lte: hastaFecha,
                },
            },
            include: {
                ordenItem: {
                    include: {
                        producto: true,
                    },
                },
            },
        });
        //Hacer los calculos totales de ventas en ese rango
        const totalVentas = ordenes.reduce((sum, orden) => sum + orden.total, 0);
        //Productos vendidos
        const productosVendidos = ordenes.reduce((sum, orden) => sum +
            orden.ordenItem.reduce((itemSum, item) => itemSum + item.cantidad, 0), 0);
        const ordenesProcesadas = ordenes.length;
        //Obtener los dias
        const dias = (hastaFecha.getTime() - desdeFecha.getTime()) / (1000 * 3600 * 24) + 1;
        const promedioDiario = totalVentas / dias;
        // Agrupar ventas diarias
        const ventasDiariasMap = new Map();
        for (const orden of ordenes) {
            const fechaStr = orden.createdAt.toISOString().slice(0, 10);
            ventasDiariasMap.set(fechaStr, (ventasDiariasMap.get(fechaStr) || 0) + orden.total);
        }
        const ventasDiarias = Array.from(ventasDiariasMap.entries()).map(([fecha, totalVentas]) => ({
            fecha: new Date(fecha),
            totalVentas,
        }));
        const productosMap = new Map();
        for (const orden of ordenes) {
            for (const item of orden.ordenItem) {
                const nombre = ((_a = item.producto) === null || _a === void 0 ? void 0 : _a.nombre) || "Producto desconocido";
                const cantidad = item.cantidad;
                const precio = ((_b = item.producto) === null || _b === void 0 ? void 0 : _b.precioVenta) || 0;
                const monto = cantidad * Number(precio);
                const data = productosMap.get(nombre);
                if (data) {
                    data.cantidad += cantidad;
                    data.monto += monto;
                }
                else {
                    productosMap.set(nombre, {
                        cantidad,
                        monto,
                    });
                }
            }
        }
        const totalUnidades = Array.from(productosMap.values()).reduce((sum, p) => sum + p.cantidad, 0);
        const productosAnalisis = Array.from(productosMap.entries()).map(([nombreProducto, { cantidad, monto }]) => ({
            nombreProducto,
            cantidadVendida: cantidad,
            montoTotal: monto,
            porcentaje: totalUnidades > 0 ? (cantidad / totalUnidades) * 100 : 0,
        }));
        const nuevoReporte = yield prisma.rEPORTE_QUINCENAL.create({
            data: {
                codigo: `RQ-${Date.now()}`,
                desde: desdeFecha,
                hasta: hastaFecha,
                usuario_fk: parseInt(usuario_fk) || null,
                totalVentas,
                productosVendidos,
                ordenesProcesadas,
                promedioDiario,
                ventasDiarias: {
                    create: ventasDiarias,
                },
                productosAnalisis: {
                    create: productosAnalisis,
                },
            },
            include: {
                ventasDiarias: true,
                productosAnalisis: true,
            },
        });
        return res.status(201).json(nuevoReporte);
    }
    catch (error) {
        console.error("Error al generar reporte:", error);
        return res.status(500).json({
            message: "Error al generar reporte quincenal.",
        });
    }
});
exports.generarReporteQuincenal = generarReporteQuincenal;
