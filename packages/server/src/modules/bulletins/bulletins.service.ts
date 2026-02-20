import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Handlebars from 'handlebars';
import prisma from '../../lib/prisma';
import { generatePdf } from '../../lib/pdf';
import { DELIB_DECISIONS } from '@edugoma360/shared/src/constants/decisions';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SubjectRow {
    name: string;
    coefficient: number;
    interro: string | null;
    interroLow: boolean;
    tp: string | null;
    tpLow: boolean;
    exam: string | null;
    examLow: boolean;
    totalPts: string;
    average: string;
    averageLow: boolean;
    subjectRank: string;
    classMax: string;
}

interface BulletinTemplateData {
    logoUrl: string;
    schoolName: string;
    province: string;
    ville: string;
    commune: string;
    agrement: string;
    telephone: string;
    academicYear: string;
    termLabel: string;
    studentPhoto: string;
    studentName: string;
    matricule: string;
    className: string;
    sectionName: string;
    sexe: string;
    dateNaissance: string;
    bulletinNumber: string;
    subjects: SubjectRow[];
    totalPoints: string;
    maxPoints: string;
    generalAverage: string;
    rank: number;
    rankSuffix: string;
    totalStudents: number;
    appreciation: string;
    decisionLabel: string;
    decisionClass: string;
    prefetName: string;
    issuedDate: string;
}

// ── In-memory batch job storage ───────────────────────────────────────────────

interface BulletinBatchJob {
    id: string;
    classId: string;
    termId: string;
    totalStudents: number;
    processed: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    results: Array<{ studentId: string; url?: string; error?: string }>;
    createdAt: Date;
}

const batchJobs = new Map<string, BulletinBatchJob>();

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDecisionClass(decision: string): string {
    const map: Record<string, string> = {
        ADMITTED: 'admitted',
        DISTINCTION: 'distinction',
        GREAT_DISTINCTION: 'great-distinction',
        ADJOURNED: 'adjourned',
        FAILED: 'failed',
        MEDICAL: 'medical',
    };
    return map[decision] || 'admitted';
}

function getRankSuffix(rank: number): string {
    return rank === 1 ? 'ᵉʳ' : 'ᵉ';
}

function generateBulletinNumber(schoolId: string, studentId: string, termId: string): string {
    // Format: SCHOOL_SHORT-YEAR-SEQHASH
    const year = new Date().getFullYear();
    const hash = (studentId + termId)
        .split('')
        .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const seq = String(hash % 9999 + 1).padStart(4, '0');
    return `EDU-${year}-${seq}`;
}

function formatScore(score: number | null, maxScore = 20): { val: string; low: boolean } {
    if (score === null || score === undefined) return { val: '', low: false };
    return { val: score.toFixed(1), low: score / maxScore < 0.5 };
}

// ── Register custom Handlebars helpers ────────────────────────────────────────
Handlebars.registerHelper('if', function (this: unknown, conditional: unknown, options: Handlebars.HelperOptions) {
    if (conditional) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper('each', function (this: unknown, context: unknown[], options: Handlebars.HelperOptions) {
    if (!Array.isArray(context)) return '';
    return context.map((item) => options.fn(item)).join('');
});

// ── Main Service ──────────────────────────────────────────────────────────────

export class BulletinsService {
    private templatePath = path.join(__dirname, 'templates', 'bulletin.html');

    /**
     * Generate a single student bulletin PDF
     */
    async generateBulletin(studentId: string, termId: string, schoolId: string): Promise<Buffer> {
        // 1. Load student data
        const student = await prisma.student.findFirst({
            where: { id: studentId, schoolId },
            include: {
                enrollments: {
                    where: { academicYear: { isActive: true } },
                    include: {
                        class: { include: { section: true } },
                        academicYear: true,
                    },
                    take: 1,
                },
            },
        });
        if (!student) throw new Error('Élève non trouvé');

        const school = await prisma.school.findUnique({ where: { id: schoolId } });
        if (!school) throw new Error('École non trouvée');

        const term = await prisma.term.findUnique({
            where: { id: termId },
            include: { academicYear: true },
        });
        if (!term) throw new Error('Trimestre non trouvé');

        const enrollment = student.enrollments[0];
        if (!enrollment) throw new Error('Inscription non trouvée');

        // 2. Load grades
        const grades = await prisma.grade.findMany({
            where: { studentId, termId },
            include: { subject: true },
        });

        // 3. Load deliberation result
        const deliberation = await prisma.deliberation.findFirst({
            where: {
                classId: enrollment.classId,
                termId,
                status: 'VALIDATED',
            },
            include: {
                results: { where: { studentId } },
            },
        });

        const deliberResult = deliberation?.results?.[0];

        // 4. Load all class results for ranking context
        const allResults = deliberation
            ? await prisma.delibResult.findMany({
                where: { deliberationId: deliberation.id },
                orderBy: { rank: 'asc' },
            })
            : [];

        const totalStudents = allResults.length || 1;

        // 5. Build subject rows grouped by subject
        const subjectMap = new Map<
            string,
            {
                name: string;
                coefficient: number;
                isEliminatory: boolean;
                scores: Map<string, { score: number; maxScore: number }>;
            }
        >();

        // Load subjects for this section
        const subjectSections = await prisma.subjectSection.findMany({
            where: { sectionId: enrollment.class.sectionId },
            include: { subject: true },
            orderBy: { subject: { name: 'asc' } },
        });

        for (const ss of subjectSections) {
            subjectMap.set(ss.subjectId, {
                name: ss.subject.name,
                coefficient: ss.coefficient,
                isEliminatory: ss.subject.isEliminatory,
                scores: new Map(),
            });
        }

        // Fill scores from grades
        for (const g of grades) {
            const entry = subjectMap.get(g.subjectId);
            if (entry) {
                entry.scores.set(g.evalType, { score: g.score, maxScore: g.maxScore });
            }
        }

        // Build subject rows
        const subjects: SubjectRow[] = [];
        let totalPtsSum = 0;
        let maxPtsSum = 0;

        for (const [, sub] of subjectMap) {
            const interroData = sub.scores.get('INTERRO') ?? null;
            const tpData = sub.scores.get('TP') ?? null;
            const examData = sub.scores.get('EXAM_TRIM') ?? null;

            const interroFmt = formatScore(interroData?.score ?? null, interroData?.maxScore);
            const tpFmt = formatScore(tpData?.score ?? null, tpData?.maxScore);
            const examFmt = formatScore(examData?.score ?? null, examData?.maxScore);

            // Calculate subject average /20
            // Weights: INTERRO 20%, TP 30%, EXAM_TRIM 50%
            const weights = [
                { score: interroData?.score ?? null, max: interroData?.maxScore ?? 20, weight: 0.2 },
                { score: tpData?.score ?? null, max: tpData?.maxScore ?? 20, weight: 0.3 },
                { score: examData?.score ?? null, max: examData?.maxScore ?? 20, weight: 0.5 },
            ];

            let subjectAvg = 0;
            let totalWeight = 0;
            for (const w of weights) {
                if (w.score !== null) {
                    subjectAvg += (w.score / w.max) * 20 * w.weight;
                    totalWeight += w.weight;
                }
            }
            const avg = totalWeight > 0 ? subjectAvg / totalWeight : 0;
            const totalPts = avg * sub.coefficient;
            const maxPts = 20 * sub.coefficient;

            totalPtsSum += totalPts;
            maxPtsSum += maxPts;

            subjects.push({
                name: sub.name,
                coefficient: sub.coefficient,
                interro: interroFmt.val || null,
                interroLow: interroFmt.low,
                tp: tpFmt.val || null,
                tpLow: tpFmt.low,
                exam: examFmt.val || null,
                examLow: examFmt.low,
                totalPts: totalPts.toFixed(1),
                average: avg.toFixed(2),
                averageLow: avg < 10,
                subjectRank: '—',
                classMax: '—',
            });
        }

        // 6. Decision
        const decision = deliberResult?.decision || 'ADMITTED';
        const decisionInfo = (DELIB_DECISIONS as any)[decision] || DELIB_DECISIONS.ADMITTED;

        // 7. Prefet info
        const prefet = await prisma.user.findFirst({
            where: { schoolId, role: 'PREFET', isActive: true },
        });
        const prefetName = prefet ? `${prefet.nom} ${prefet.prenom || ''}`.trim() : 'Le Préfet';

        // 8. Compile template
        const rank = deliberResult?.rank ?? 0;
        const generalAverage = deliberResult?.generalAverage ?? (totalPtsSum / (maxPtsSum / 20) || 0);

        const data: BulletinTemplateData = {
            logoUrl: (school as any).logoUrl || '',
            schoolName: school.name,
            province: (school as any).province || 'Nord-Kivu',
            ville: (school as any).ville || 'Goma',
            commune: (school as any).commune || '',
            agrement: (school as any).agrement || 'N/A',
            telephone: (school as any).telephone || 'N/A',
            academicYear: term.academicYear.label,
            termLabel: term.label,
            studentPhoto: student.photoUrl || '',
            studentName: `${student.nom.toUpperCase()} ${student.postNom.toUpperCase()}${student.prenom ? ' ' + student.prenom : ''}`,
            matricule: student.matricule,
            className: enrollment.class.name,
            sectionName: enrollment.class.section.name,
            sexe: student.sexe === 'M' ? 'Masculin' : 'Féminin',
            dateNaissance: student.dateNaissance
                ? format(new Date(student.dateNaissance), 'd MMMM yyyy', { locale: fr })
                : 'N/A',
            bulletinNumber: generateBulletinNumber(schoolId, studentId, termId),
            subjects,
            totalPoints: totalPtsSum.toFixed(1),
            maxPoints: maxPtsSum.toFixed(0),
            generalAverage: generalAverage.toFixed(2),
            rank,
            rankSuffix: getRankSuffix(rank),
            totalStudents,
            appreciation: deliberResult
                ? (deliberResult as any).appreciation || 'Bon élève, continuez vos efforts.'
                : '—',
            decisionLabel: decisionInfo.label,
            decisionClass: getDecisionClass(decision),
            prefetName,
            issuedDate: format(new Date(), 'dd/MM/yyyy'),
        };

        const templateSrc = await fs.readFile(this.templatePath, 'utf-8');
        const template = Handlebars.compile(templateSrc);
        const html = template(data);

        return generatePdf(html, { format: 'A4', printBackground: true });
    }

    /**
     * Generate bulletins for an entire class (background job)
     */
    async createBatchJob(classId: string, termId: string, schoolId: string): Promise<string> {
        // Get all enrolled students
        const enrollments = await prisma.enrollment.findMany({
            where: { classId },
            select: { studentId: true },
        });

        const studentIds = enrollments.map((e) => e.studentId);

        const jobId = `bulletin_batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const job: BulletinBatchJob = {
            id: jobId,
            classId,
            termId,
            totalStudents: studentIds.length,
            processed: 0,
            status: 'pending',
            results: [],
            createdAt: new Date(),
        };

        batchJobs.set(jobId, job);

        // Run in background
        this.processBatchJob(jobId, studentIds, termId, schoolId).catch((err) => {
            console.error(`[BulletinsService] Batch job ${jobId} failed:`, err);
            const j = batchJobs.get(jobId);
            if (j) j.status = 'failed';
        });

        return jobId;
    }

    private async processBatchJob(
        jobId: string,
        studentIds: string[],
        termId: string,
        schoolId: string,
    ): Promise<void> {
        const job = batchJobs.get(jobId);
        if (!job) return;

        job.status = 'processing';

        for (const studentId of studentIds) {
            try {
                const pdf = await this.generateBulletin(studentId, termId, schoolId);

                // Save PDF to uploads/bulletins/
                const uploadsDir = path.join(
                    __dirname,
                    '..',
                    '..',
                    '..',
                    '..',
                    'uploads',
                    'bulletins',
                );
                await fs.mkdir(uploadsDir, { recursive: true });

                const filename = `bulletin_${studentId}_${termId}_${Date.now()}.pdf`;
                const filepath = path.join(uploadsDir, filename);
                await fs.writeFile(filepath, pdf);

                job.results.push({
                    studentId,
                    url: `/uploads/bulletins/${filename}`,
                });
            } catch (err: any) {
                console.error(`[BulletinsService] Error for student ${studentId}:`, err.message);
                job.results.push({ studentId, error: err.message });
            } finally {
                job.processed++;
            }
        }

        job.status = 'completed';
    }

    /**
     * Get batch job status
     */
    getBatchJobStatus(jobId: string): BulletinBatchJob | null {
        return batchJobs.get(jobId) || null;
    }
}

export const bulletinsService = new BulletinsService();
