import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const verificarCarritos = async () => {
  const usuarioId = "1";  // Cambia este valor según el usuarioId que quieras verificar
  const guestId = "123";   // Cambia este valor según el guestId que quieras verificar

  const conditions: any[] = [];

  // Agregar condiciones de búsqueda
  if (usuarioId) {
    conditions.push({ usuario_fk: Number(usuarioId) });
  }

  if (guestId) {
    conditions.push({ guestId: guestId });
  }

  // Realizar la consulta
  const carritos = await prisma.cARRITO.findMany({
    where: {
      OR: conditions,
    },
  });

  // Verificar si se encontraron carritos
  if (carritos.length > 0) {
    console.log("Carritos encontrados:", carritos);
  } else {
    console.log("No se encontraron carritos");
  }
};

verificarCarritos().catch((error) => {
  console.error("Error al verificar carritos:", error);
}).finally(() => {
  prisma.$disconnect();
});
