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
exports.updateStateUser = exports.getAllUsers = exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
const getAllUsers = (__req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const usuarios = yield exports.prisma.pERSONA.findMany({
            include: {
                usuario: {
                    include: {
                        rol: {
                            select: {
                                descripcion: true,
                            },
                        },
                        ordenes: true,
                    },
                },
            },
        });
        if (!usuarios || usuarios.length === 0) {
            return res.status(404).json({ error: "No se encontraron usuarios" });
        }
        const usuariosResumen = usuarios.map((u) => {
            var _a;
            const { usuario } = u, personaData = __rest(u, ["usuario"]);
            if (!usuario)
                return Object.assign(Object.assign({}, personaData), { cantidadOrdenes: 0, montoTotalOrdenes: 0, rol: null, estado: null });
            const ordenes = usuario.ordenes || [];
            const cantidadOrdenes = ordenes.length;
            const montoTotalOrdenes = ordenes.reduce((sum, orden) => sum + (orden.total || 0), 0);
            return Object.assign(Object.assign({}, personaData), { rol: ((_a = usuario.rol) === null || _a === void 0 ? void 0 : _a.descripcion) || null, estado: usuario.estado || null, correo: usuario.correo || null, telefono: usuario.telefono || null, ultimoAcceso: usuario.ultimoAcceso || null, cantidadOrdenes,
                montoTotalOrdenes });
        });
        return res.status(200).json({ usuarios: usuariosResumen });
    }
    catch (error) {
        return res.status(500).json({ error: "Error al obtener usuarios" });
    }
});
exports.getAllUsers = getAllUsers;
const updateStateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { estado, usuario_pk } = req.body;
    if (!estado && !usuario_pk) {
        return res.status(400).json({
            error: "Estado y usuario_pk son requeridos",
        });
    }
    console.log(estado);
    try {
        const user = yield exports.prisma.uSUARIO.update({
            where: {
                usuario_pk: Number(usuario_pk),
            },
            data: {
                estado: estado,
            },
        });
        if (!user) {
            return res.status(404).json({
                error: "Usuario no encontrado",
            });
        }
        console.log(user);
        return res.status(200).json({
            message: "Estado actualizado correctamente",
            user: user,
        });
    }
    catch (error) {
        return res.status(500).json({ error: "Error al actualizar estado del usuario" });
    }
});
exports.updateStateUser = updateStateUser;
