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
exports.resetPassword = exports.requestPasswordReset = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const mailService_1 = require("../../services/mailService");
const prisma = new client_1.PrismaClient();
const crypto_1 = __importDefault(require("crypto"));
// Función de login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { correo, contrasena } = req.body;
    // Validación de campos requeridos
    if (!correo || !contrasena) {
        return res
            .status(400)
            .json({ error: "Correo y contraseña son requeridos" });
    }
    // Validar formato de correo (opcional, pero recomendado)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        return res
            .status(400)
            .json({ error: "El correo proporcionado no es válido" });
    }
    try {
        // Buscar al usuario por correo
        const user = yield prisma.uSUARIO.findUnique({
            where: { correo },
            include: { rol: true },
        });
        console.log(user);
        if (!user) {
            return res.status(400).json({ error: "Usuario no encontrado" });
        }
        if (user.estado == "Inactivo") {
            return res.status(400).json({ error: "Usuario no encontrado" });
        }
        // Comparar las contraseñas
        const isMatch = yield bcryptjs_1.default.compare(contrasena, user.contrasena);
        if (!isMatch) {
            return res.status(400).json({ error: "Contraseña incorrecta" });
        }
        // Verificar la clave secreta para el JWT
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res
                .status(500)
                .json({ error: "Clave secreta para JWT no configurada" });
        }
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
        // Generar el token JWT
        const token = jsonwebtoken_1.default.sign({
            userId: user.usuario_pk,
            passwordChangedAt: ((_a = user.passwordChangedAt) === null || _a === void 0 ? void 0 : _a.getTime()) || 0,
        }, jwtSecret, { expiresIn: "1h" });
        yield prisma.uSUARIO.update({
            where: { usuario_pk: user.usuario_pk },
            data: { ultimoAcceso: new Date() },
        });
        return res.status(200).json({
            message: "Inicio de sesión exitoso",
            token,
            userId: user.usuario_pk,
            carritoId: carrito.carrito_pk,
            rol: user.rol_fk,
        });
    }
    catch (error) {
        console.error("Error al iniciar sesión:", error);
        return res.status(500).json({ error: "Error interno al iniciar sesión" });
    }
});
exports.login = login;
const requestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { correo } = req.body;
    try {
        const user = yield prisma.uSUARIO.findUnique({ where: { correo } });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        const token = crypto_1.default.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 3600000);
        yield prisma.uSUARIO.update({
            where: { usuario_pk: user.usuario_pk },
            data: {
                resetToken: token,
                resetTokenExpiry: expiry,
            },
        });
        yield (0, mailService_1.sendResetPasswordEmail)(correo, token);
        return res
            .status(200)
            .json({ message: "Correo enviado con instrucciones." });
    }
    catch (err) {
        return res.status(500).json({ message: "Error enviando el correo." });
    }
});
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    const { newPassword } = req.body;
    try {
        const user = yield prisma.uSUARIO.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() },
            },
        });
        if (!user) {
            return res.status(400).json({ message: "Token inválido o expirado" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        yield prisma.uSUARIO.update({
            where: { usuario_pk: user.usuario_pk },
            data: {
                contrasena: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
                passwordChangedAt: new Date(),
            },
        });
        return res
            .status(200)
            .json({ message: "Contraseña actualizada correctamente." });
    }
    catch (err) {
        return res
            .status(500)
            .json({ message: "Error actualizando la contraseña." });
    }
});
exports.resetPassword = resetPassword;
