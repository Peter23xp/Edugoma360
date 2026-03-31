import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const classes = await prisma.class.findMany({
        include: {
            _count: {
                select: { enrollments: true }
            },
            enrollments: {
                include: { student: true, academicYear: true }
            }
        }
    });

    for (const c of classes) {
        console.log(`Class: ${c.name} (${c.id})`);
        console.log(`  _count.enrollments: ${c._count.enrollments}`);
        console.log(`  Actual enrollments array length: ${c.enrollments.length}`);
        c.enrollments.forEach(e => {
            console.log(`    -> Student: ${e.student.nom} ${e.student.postNom} (Active Year: ${e.academicYear.isActive})`);
        });
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
