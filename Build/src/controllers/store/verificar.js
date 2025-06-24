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
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const verificarCarritos = () => __awaiter(void 0, void 0, void 0, function* () {
    const usuarioId = "1"; // Cambia este valor según el usuarioId que quieras verificar
    const guestId = "123"; // Cambia este valor según el guestId que quieras verificar
    const conditions = [];
    // Agregar condiciones de búsqueda
    if (usuarioId) {
        conditions.push({ usuario_fk: Number(usuarioId) });
    }
    if (guestId) {
        conditions.push({ guestId: guestId });
    }
    // Realizar la consulta
    const carritos = yield prisma.cARRITO.findMany({
        where: {
            OR: conditions,
        },
    });
    // Verificar si se encontraron carritos
    if (carritos.length > 0) {
        console.log("Carritos encontrados:", carritos);
    }
    else {
        console.log("No se encontraron carritos");
    }
});
verificarCarritos().catch((error) => {
    console.error("Error al verificar carritos:", error);
}).finally(() => {
    prisma.$disconnect();
});
