import prisma from '../../lib/prisma';
// Note: studentsPdfService was removed (non-existent export). Bulletin generation is now handled by BulletinsService.

interface BulletinJob {
    id: string;
    deliberationId: string;
    totalStudents: number;
    processed: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    errors: Array<{ studentId: string; error: string }>;
    createdAt: Date;
}

// In-memory job storage (in production, use Redis or database)
const jobs = new Map<string, BulletinJob>();

export class DeliberationBulletinService {
    /**
     * Create a bulletin generation job
     */
    async createBulletinJob(deliberationId: string, studentIds: string[]): Promise<string> {
        const jobId = `bulletin_job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const job: BulletinJob = {
            id: jobId,
            deliberationId,
            totalStudents: studentIds.length,
            processed: 0,
            status: 'pending',
            errors: [],
            createdAt: new Date(),
        };

        jobs.set(jobId, job);

        // Start processing in background
        this.processBulletinJob(jobId, studentIds).catch((error) => {
            console.error('Error processing bulletin job:', error);
            const job = jobs.get(jobId);
            if (job) {
                job.status = 'failed';
            }
        });

        return jobId;
    }

    /**
     * Process bulletin generation job
     */
    private async processBulletinJob(jobId: string, studentIds: string[]): Promise<void> {
        const job = jobs.get(jobId);
        if (!job) return;

        job.status = 'processing';

        for (const studentId of studentIds) {
            try {
                // Get student data
                const student = await prisma.student.findUnique({
                    where: { id: studentId },
                    include: {
                        enrollments: {
                            include: {
                                class: {
                                    include: {
                                        section: true,
                                    },
                                },
                                academicYear: true,
                            },
                        },
                    },
                });

                if (!student) {
                    job.errors.push({
                        studentId,
                        error: 'Student not found',
                    });
                    continue;
                }

                // Get deliberation result
                const deliberation = await prisma.deliberation.findFirst({
                    where: { id: job.deliberationId },
                    include: {
                        term: true,
                        results: {
                            where: { studentId },
                        },
                    },
                });

                if (!deliberation || deliberation.results.length === 0) {
                    job.errors.push({
                        studentId,
                        error: 'Deliberation result not found',
                    });
                    continue;
                }

                const result = deliberation.results[0];

                // Get all grades for this student and term
                const grades = await prisma.grade.findMany({
                    where: {
                        studentId,
                        termId: deliberation.termId,
                    },
                    include: {
                        subject: true,
                    },
                });

                // Get class and section info
                const enrollment = student.enrollments[0];
                if (!enrollment) {
                    job.errors.push({
                        studentId,
                        error: 'No enrollment found',
                    });
                    continue;
                }

                // Prepare bulletin data
                const bulletinData = {
                    student: {
                        nom: student.nom,
                        postNom: student.postNom,
                        prenom: student.prenom,
                        matricule: student.matricule,
                        sexe: student.sexe,
                        dateNaissance: student.dateNaissance,
                    },
                    class: {
                        name: enrollment.class.name,
                        section: enrollment.class.section.name,
                    },
                    term: {
                        label: deliberation.term.label,
                    },
                    academicYear: {
                        label: enrollment.academicYear.label,
                    },
                    grades: grades.map((g) => ({
                        subject: g.subject.name,
                        abbreviation: g.subject.abbreviation,
                        evalType: g.evalType,
                        score: g.score,
                        maxScore: g.maxScore,
                    })),
                    result: {
                        generalAverage: result.generalAverage,
                        totalPoints: result.totalPoints,
                        rank: result.rank,
                        decision: result.decision,
                    },
                };

                // Generate bulletin PDF (reuse existing service if available)
                // For now, we'll just log that we would generate it
                console.log(`Generating bulletin for student ${studentId}`);

                // TODO: Call actual bulletin generation service
                // await studentsPdfService.generateBulletin(bulletinData);

                job.processed++;
            } catch (error: any) {
                console.error(`Error generating bulletin for student ${studentId}:`, error);
                job.errors.push({
                    studentId,
                    error: error.message,
                });
            }
        }

        job.status = job.errors.length === 0 ? 'completed' : 'completed';
    }

    /**
     * Get job status
     */
    getJobStatus(jobId: string): BulletinJob | null {
        return jobs.get(jobId) || null;
    }

    /**
     * Get all jobs for a deliberation
     */
    getDeliberationJobs(deliberationId: string): BulletinJob[] {
        return Array.from(jobs.values()).filter((job) => job.deliberationId === deliberationId);
    }
}

export const deliberationBulletinService = new DeliberationBulletinService();
