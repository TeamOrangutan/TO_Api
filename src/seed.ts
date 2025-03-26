// Crea un script llamado `seed.ts` o usa este código en tu aplicación
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedRoles() {
  await prisma.rOL.createMany({
    data: [
      { descripcion: 'Administrador' },
      { descripcion: 'Cliente' },
      // Agrega otros roles necesarios
    ],
    skipDuplicates: true,
  });
  console.log('Roles creados exitosamente');
}

seedRoles()
  .catch((e) => {
    console.error('Error creando roles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });