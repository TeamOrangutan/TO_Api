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
// Crea un script llamado `seed.ts` o usa este código en tu aplicación
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function seedRoles() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.rOL.createMany({
            data: [
                { descripcion: 'Administrador' },
                { descripcion: 'Cliente' },
                // Agrega otros roles necesarios
            ],
            skipDuplicates: true,
        });
        console.log('Roles creados exitosamente');
    });
}
seedRoles()
    .catch((e) => {
    console.error('Error creando roles:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
