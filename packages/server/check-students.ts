import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.student.count();
  console.log('Nombre eleves en DB:', count);

  const students = await prisma.student.findMany({
    select: { matricule: true, nom: true, prenom: true, statut: true, isActive: true },
  });
  console.log(JSON.stringify(students, null, 2));

  const enrollments = await prisma.enrollment.count();
  console.log('Nombre inscriptions:', enrollments);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
