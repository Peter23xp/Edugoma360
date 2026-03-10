import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const teachers = await prisma.teacher.findMany({ select: { id: true, matricule: true, telephone: true, nom: true } });
    console.log(JSON.stringify(teachers, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
