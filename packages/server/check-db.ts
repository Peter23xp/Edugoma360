import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const schools = await prisma.school.findMany();
    console.log('Schools:', schools.length);
    const years = await prisma.academicYear.findMany({ include: { school: true } });
    console.log('Academic Years:', years);
}
main();
