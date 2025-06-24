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
exports.updateUserData = exports.userProfile = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const supabaseClient_1 = __importDefault(require("../../utils/supabaseClient"));
exports.prisma = new client_1.PrismaClient();
const userProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { usuarioId } = req.params;
    if (!usuarioId) {
        res
            .status(400)
            .json({ error: "Faltan datos necesarios o userId inválido" });
        return;
    }
    try {
        const usuario = yield exports.prisma.uSUARIO.findUnique({
            where: {
                usuario_pk: Number(usuarioId),
            },
            select: {
                usuario_pk: true,
                correo: true,
                telefono: true,
                rol: {
                    select: {
                        descripcion: true,
                    },
                },
                persona: {
                    select: {
                        nombres: true,
                        apellidos: true,
                        direccion: true,
                        imagenPerfil: true,
                    },
                },
            },
        });
        console.log(usuario);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        return res.status(200).json(usuario);
    }
    catch (error) {
        console.error("Error al obtener el usuario:", error);
        return res.status(500).json({ message: "Error del servidor" });
    }
});
exports.userProfile = userProfile;
const updateUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { usuarioId } = req.params;
    const { nombres, apellidos, direccion, correo, telefono } = req.body;
    let imagenPerfilUrl;
    if (req.file) {
        const validTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validTypes.includes(req.file.mimetype)) {
            return res
                .status(400)
                .json({ error: "Archivo no es una imagen válida." });
        }
        const fileName = `avatar-${Date.now()}-${req.file.originalname}`;
        const filePath = `${fileName}`; // <-- carpeta dentro del bucket avatar
        const { error: uploadError } = yield supabaseClient_1.default.storage
            .from("avatar")
            .upload(filePath, req.file.buffer, { contentType: req.file.mimetype });
        if (uploadError) {
            console.error("Error subiendo imagen a Supabase:", uploadError);
            return res
                .status(500)
                .json({ error: "Error al subir imagen de perfil." });
        }
        const { data } = supabaseClient_1.default.storage.from("avatar").getPublicUrl(filePath);
        imagenPerfilUrl = data.publicUrl;
    }
    try {
        // Verificar si el correo ya está en uso por otro usuario (excepto el actual)
        const existingUser = yield exports.prisma.uSUARIO.findFirst({
            where: {
                correo,
                NOT: { usuario_pk: Number(usuarioId) },
            },
        });
        if (existingUser) {
            return res
                .status(400)
                .json({ error: "Este correo ya está en uso por otro usuario." });
        }
        // Actualiza datos de persona
        const updatedPersona = yield exports.prisma.pERSONA.update({
            where: { usuario_fk: Number(usuarioId) },
            data: Object.assign({ nombres,
                apellidos,
                direccion }, (imagenPerfilUrl && { imagenPerfil: imagenPerfilUrl })),
        });
        // Actualiza el correo en USUARIO
        const updatedUsuario = yield exports.prisma.uSUARIO.update({
            where: { usuario_pk: Number(usuarioId) },
            data: { correo, telefono },
        });
        return res.status(200).json({
            message: "Usuario actualizado correctamente",
            persona: updatedPersona,
            usuario: updatedUsuario,
        });
    }
    catch (error) {
        console.error("Error actualizando datos:", error);
        return res
            .status(500)
            .json({ error: "Error al actualizar los datos del usuario" });
    }
});
exports.updateUserData = updateUserData;
