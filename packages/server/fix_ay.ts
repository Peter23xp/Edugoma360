import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const schoolId = 'school-001';
  
  // Deactivate all years first to be sure
  await prisma.academicYear.updateMany({
    where: { schoolId },
    data: { isActive: false }
  });

  // Activate only the TEST-2025 one
  await prisma.academicYear.update({
    where: { id: '8c0a670d-a446-4510-b393-db5c9dd93e2d' },
    data: { isActive: true }
  });

  console.log('Fixed multiple active years. Only TEST-2025 is now active.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
