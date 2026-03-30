import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, nom: true, schoolId: true } });
  console.log('Users (Sample):', JSON.stringify(users, null, 2));

  const schools = await prisma.school.findMany({ select: { id: true, name: true } });
  console.log('Schools:', JSON.stringify(schools, null, 2));

  const ay = await prisma.academicYear.findMany({ include: { terms: true } });
  console.log('Years (Sample):', JSON.stringify(ay, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
