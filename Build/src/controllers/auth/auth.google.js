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
exports.googleAuth = void 0;
const client_1 = require("@prisma/client");
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const cliente = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { token } = req.body;
    try {
        const ticket = yield cliente.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).json({ error: "Token inválido" });
        }
        const { email, given_name, family_name, picture } = payload;
        if (!email) {
            return res.status(400).json({ error: "No se recibió un email válido desde Google" });
        }
        let user = yield prisma.uSUARIO.findUnique({
            where: { correo: email },
            include: { rol: true },
        });
        if ((user === null || user === void 0 ? void 0 : user.estado) == "Inactivo") {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }
        if (!user) {
            const defaultRole = yield prisma.rOL.findFirst({
                where: { descripcion: "User" },
            });
            if (!defaultRole) {
                return res.status(401).json({ error: "Rol por defecto no encontrado" });
            }
            user = yield prisma.uSUARIO.create({
                data: {
                    estado: "Activo",
                    correo: email,
                    contrasena: "google_oauth_default_password",
                    rol_fk: defaultRole.rol_pk,
                },
                include: { rol: true },
            });
            yield prisma.pERSONA.create({
                data: {
                    nombres: given_name || "Nombre",
                    apellidos: family_name || "Apellido",
                    direccion: "",
                    usuario_fk: user.usuario_pk,
                    imagenPerfil: picture || undefined,
                },
            });
        }
        // 🔄 Buscar o crear carrito
        let carrito = yield prisma.cARRITO.findUnique({
            where: {
                usuario_fk: user.usuario_pk,
            },
        });
        if (!carrito) {
            carrito = yield prisma.cARRITO.create({
                data: {
                    usuario: {
                        connect: { usuario_pk: user.usuario_pk },
                    },
                    total: 0,
                },
            });
        }
        // 🔐 Generar token
        const jwtToken = jsonwebtoken_1.default.sign({
            userId: user.usuario_pk,
            passwordChangedAt: ((_a = user.passwordChangedAt) === null || _a === void 0 ? void 0 : _a.getTime()) || 0,
        }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        yield prisma.uSUARIO.update({
            where: { usuario_pk: user.usuario_pk },
            data: { ultimoAcceso: new Date() },
        });
        return res.status(200).json({
            message: "Autenticación exitosa",
            token: jwtToken,
            userId: user.usuario_pk,
            carritoId: carrito.carrito_pk,
            rol: user.rol.rol_pk,
        });
    }
    catch (err) {
        console.error("Error en login con Google:", err);
        return res.status(401).json({ error: "Error de autenticación con Google" });
    }
});
exports.googleAuth = googleAuth;
