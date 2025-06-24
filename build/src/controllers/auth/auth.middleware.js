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
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const jwtSecret = process.env.JWT_SECRET;
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token no proporcionado" });
    }
    const token = authHeader.split(" ")[1];
    try {
        // 2. Decodificar el token
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        // 3. Buscar al usuario
        const user = yield prisma.uSUARIO.findUnique({
            where: { usuario_pk: decoded.userId },
        });
        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado" });
        }
        const passwordChangedAt = ((_a = user.passwordChangedAt) === null || _a === void 0 ? void 0 : _a.getTime()) || 0;
        if (passwordChangedAt > decoded.iat * 1000) {
            return res
                .status(401)
                .json({ message: "Contraseña cambiada. Vuelve a iniciar sesión." });
        }
        return next();
    }
    catch (err) {
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
});
exports.authenticate = authenticate;
