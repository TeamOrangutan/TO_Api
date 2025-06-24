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
exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombres, apellidos, correo, direccion, contrasena } = req.body;
    if (!nombres || !apellidos || !correo || !direccion || !contrasena) {
        return res.status(400).json({ error: "Todos los campos son requeridos." });
    }
    try {
        const existeUsuario = yield prisma.uSUARIO.findUnique({
            where: { correo },
        });
        if (existeUsuario) {
            return res.status(409).json({ error: "Este correo ya está registrado." });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(contrasena, 10);
        const nuevoUsuario = yield prisma.uSUARIO.create({
            data: {
                estado: "Activo",
                correo,
                contrasena: hashedPassword,
                rol_fk: 2, // Cambia según tu lógica
                persona: {
                    create: {
                        nombres,
                        apellidos,
                        direccion,
                    },
                },
            },
            include: {
                persona: true,
            },
        });
        return res
            .status(201)
            .json({ message: "Usuario creado correctamente", usuario: nuevoUsuario });
    }
    catch (error) {
        console.error("Error al registrar usuario:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
});
exports.register = register;
