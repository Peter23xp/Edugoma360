import prisma from '../../lib/prisma';
import { generatePdf } from '../../lib/pdf';
import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RankingRow {
    rank: number;
    studentName: string;
    generalAverage: number;
    totalPoints: number;
    decision: string;
    mention: string;
    badge: string;
}

interface PalmaresSummary {
    total: number;
    passed: number;
    passRate: number;
    classAverage: number;
    highest: number;
    lowest: number;
}

interface PalmaresData {
    class: any;
    term: any;
    academicYear: any;
    rankings: RankingRow[];
    summary: PalmaresSummary;
}

export class PalmaresService {
    /**
     * Get palmares data for a class and term
     */
    async getPalmares(classId: string, termId: string, schoolId: string): Promise<PalmaresData> {
        // Verify class belongs to school
        const classData = await prisma.class.findFirst({
            where: {
                id: classId,
                schoolId,
            },
            include: {
                section: true,
            },
        });

        if (!classData) {
            throw new Error('CLASS_NOT_FOUND');
        }

        // Get term
        const term = await prisma.term.findFirst({
            where: { id: termId },
            include: { academicYear: true },
        });

        if (!term) {
            throw new Error('TERM_NOT_FOUND');
        }

        // Get deliberation
        const deliberation = await prisma.deliberation.findFirst({
            where: {
                classId,
                termId,
                status: 'VALIDATED',
            },
        });

        if (!deliberation) {
            throw new Error('DELIBERATION_NOT_VALIDATED');
        }

        // Get all results
        const results = await prisma.delibResult.findMany({
            where: {
                deliberationId: deliberation.id,
            },
            include: {
                student: true,
            },
            orderBy: {
                rank: 'asc',
            },
        });

        // Build rankings
        const rankings: RankingRow[] = results.map((r) => ({
            rank: r.rank,
            studentName: `${r.student.nom} ${r.student.postNom}${r.student.prenom ? ' ' + r.student.prenom : ''}`,
            generalAverage: r.generalAverage,
            totalPoints: r.totalPoints,
            decision: r.decision,
            mention: this.getMention(r.decision, r.generalAverage, r.rank),
            badge: this.getBadge(r.rank, r.decision),
        }));

        // Calculate summary
        const passed = results.filter((r) =>
            ['ADMITTED', 'DISTINCTION', 'GREAT_DISTINCTION'].includes(r.decision)
        ).length;

        const classAverage =
            results.reduce((sum, r) => sum + r.generalAverage, 0) / results.length;

        const summary: PalmaresSummary = {
            total: results.length,
            passed,
            passRate: (passed / results.length) * 100,
            classAverage,
            highest: results[0]?.generalAverage || 0,
            lowest: results[results.length - 1]?.generalAverage || 0,
        };

        return {
            class: classData,
            term,
            academicYear: term.academicYear,
            rankings,
            summary,
        };
    }

    /**
     * Generate palmares PDF
     */
    async generatePalmaresPdf(
        classId: string,
        termId: string,
        schoolId: string
    ): Promise<Buffer> {
        const data = await this.getPalmares(classId, termId, schoolId);

        // Get school info
        const school = await prisma.school.findUnique({
            where: { id: schoolId },
        });

        if (!school) {
            throw new Error('SCHOOL_NOT_FOUND');
        }

        // Get prefet
        const prefet = await prisma.user.findFirst({
            where: {
                schoolId,
                role: 'PREFET',
                isActive: true,
            },
        });

        const prefetName = prefet ? `${prefet.nom} ${prefet.prenom || ''}`.trim() : 'Le Préfet';

        // Prepare template data
        const templateData = {
            schoolName: school.name,
            province: (school as any).province || 'Nord-Kivu',
            ville: (school as any).ville || 'Goma',
            logoUrl: (school as any).logoUrl || '',
            agrement: (school as any).agrement || 'N/A',
            className: data.class.name,
            sectionName: data.class.section.name,
            termLabel: data.term.label,
            academicYear: data.academicYear.label,
            rankings: data.rankings,
            totalStudents: data.summary.total,
            passed: data.summary.passed,
            passRate: data.summary.passRate.toFixed(1),
            classAverage: data.summary.classAverage.toFixed(2),
            highest: data.summary.highest.toFixed(2),
            lowest: data.summary.lowest.toFixed(2),
            prefetName,
            issuedDate: format(new Date(), 'd MMMM yyyy', { locale: fr }),
        };

        // Load template
        const templatePath = path.join(__dirname, 'templates', 'palmares.html');
        const templateSrc = await fs.readFile(templatePath, 'utf-8');
        const template = Handlebars.compile(templateSrc);
        const html = template(templateData);

        // Generate PDF
        return generatePdf(html, { format: 'A4', printBackground: true });
    }

    /**
     * Get mention label
     */
    private getMention(decision: string, average: number, rank: number): string {
        if (rank === 1) return '🥇 1er';
        if (rank === 2) return '🥈 2ème';
        if (rank === 3) return '🥉 3ème';

        if (decision === 'GREAT_DISTINCTION') return 'Grande Distinction';
        if (decision === 'DISTINCTION') return 'Distinction';
        if (decision === 'ADMITTED') return 'Admis';
        if (decision === 'ADJOURNED') return '⚠️ Ajourné';
        if (decision === 'FAILED') return '❌ Refusé';
        if (decision === 'MEDICAL') return 'Reporté';

        return 'Admis';
    }

    /**
     * Get badge emoji
     */
    private getBadge(rank: number, decision: string): string {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        if (decision === 'ADJOURNED') return '⚠️';
        if (decision === 'FAILED') return '❌';
        return '';
    }
}

export const palmaresService = new PalmaresService();
