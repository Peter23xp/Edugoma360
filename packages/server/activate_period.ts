import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Activate the latest academic year and latest term for testing
  const latestTerm = await prisma.term.findFirst({
    orderBy: { startDate: 'desc' },
    include: { academicYear: true }
  });

  if (!latestTerm) {
    console.log('No term found');
    return;
  }

  await prisma.term.update({
    where: { id: latestTerm.id },
    data: { isActive: true }
  });

  await prisma.academicYear.update({
    where: { id: latestTerm.academicYearId },
    data: { isActive: true }
  });

  console.log(`Activated period: ${latestTerm.academicYear.label} - ${latestTerm.label}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
