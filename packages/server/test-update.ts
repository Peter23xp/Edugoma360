import { PrismaClient } from '@prisma/client';
import { studentsService } from './src/modules/students/students.service';

const prisma = new PrismaClient();

async function main() {
    const student = await prisma.student.findFirst({ where: { nom: 'AMISI', postNom: 'KALOMBO' } });
    if (!student) throw new Error('Student not found');

    const klass = await prisma.class.findFirst();
    if (!klass) throw new Error('Class not found');

    const year = await prisma.academicYear.findFirst({ where: { isActive: true } });
    if (!year) throw new Error('Academic year not found');

    console.log(`Updating student ${student.id} to class ${klass.id} in year ${year.id}...`);

    try {
        const result = await studentsService.updateStudent(student.id, student.schoolId, {
            classId: klass.id,
            academicYearId: year.id,
            nom: student.nom,
            postNom: student.postNom,
            sexe: student.sexe,
            lieuNaissance: student.lieuNaissance,
            dateNaissance: student.dateNaissance.toISOString(),
            nationalite: student.nationalite,
        });

        console.log('Update result:', result);

        const check = await prisma.enrollment.findMany({ where: { studentId: student.id } });
        console.log('Enrollments after update:', check);

    } catch (e) {
        console.error('Error updating:', e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
