import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const activeTerm = await prisma.term.findFirst({
    where: { academicYear: { isActive: true }, isActive: true },
    include: { academicYear: true }
  });

  console.log('Active Term:', JSON.stringify(activeTerm, null, 2));

  const allTerms = await prisma.term.findMany({
    include: { academicYear: { select: { isActive: true, label: true } } }
  });
  console.log('All Terms (Sample):', JSON.stringify(allTerms.slice(0, 5), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
