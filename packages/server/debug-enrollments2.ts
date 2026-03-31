import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const students = await prisma.student.findMany({
        include: {
            enrollments: true
        }
    });

    console.log(`Total students: ${students.length}`);
    for (const s of students) {
        console.log(`Student: ${s.nom} ${s.postNom} (${s.id})`);
        console.log(`  Enrollments count: ${s.enrollments.length}`);
        s.enrollments.forEach(e => {
            console.log(`    -> Enrollment ID: ${e.id}, classId: ${e.classId}, academicYearId: ${e.academicYearId}`);
        });
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
