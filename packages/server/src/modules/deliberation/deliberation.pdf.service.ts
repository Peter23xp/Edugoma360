import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { DELIB_DECISIONS } from '@edugoma360/shared/src/constants/decisions';

interface PVData {
    schoolName: string;
    province: string;
    ville: string;
    className: string;
    sectionName: string;
    termLabel: string;
    academicYear: string;
    date: string;
    prefetName: string;
    totalStudents: number;
    totalAdmitted: number;
    successRate: string;
    countAdmitted: number;
    countDistinction: number;
    countGreatDistinction: number;
    countAdjourned: number;
    countFailed: number;
    countMedical: number;
    adjournedRate: string;
    failedRate: string;
    modifiedDecisions: number;
    students: Array<{
        rank: number;
        studentName: string;
        average: string;
        points: string;
        decisionLabel: string;
        decisionClass: string;
        justification?: string;
    }>;
    generatedAt: string;
}

export class DeliberationPdfService {
    private templatePath = path.join(__dirname, 'templates', 'pv-template.html');

    /**
     * Generate PV PDF for a deliberation
     */
    async generatePV(data: PVData): Promise<string> {
        try {
            // Read template
            const templateHtml = await fs.readFile(this.templatePath, 'utf-8');

            // Compile template
            const template = Handlebars.compile(templateHtml);

            // Register Handlebars helpers
            Handlebars.registerHelper('if', function (conditional: any, options: any) {
                if (conditional) {
                    return options.fn(this);
                } else {
                    return options.inverse(this);
                }
            });

            Handlebars.registerHelper('each', function (context: any, options: any) {
                let ret = '';
                for (let i = 0; i < context.length; i++) {
                    ret = ret + options.fn(context[i]);
                }
                return ret;
            });

            // Generate HTML
            const html = template(data);

            // Launch Puppeteer
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });

            const page = await browser.newPage();

            // Set content
            await page.setContent(html, {
                waitUntil: 'networkidle0',
            });

            // Generate PDF
            const uploadsDir = path.join(__dirname, '..', '..', '..', '..', 'uploads', 'pv');
            await fs.mkdir(uploadsDir, { recursive: true });

            const filename = `pv_${data.className.replace(/\s+/g, '_')}_${data.termLabel.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
            const filepath = path.join(uploadsDir, filename);

            await page.pdf({
                path: filepath,
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '2cm',
                    right: '2cm',
                    bottom: '2cm',
                    left: '2cm',
                },
            });

            await browser.close();

            // Return relative URL
            return `/uploads/pv/${filename}`;
        } catch (error) {
            console.error('Error generating PV PDF:', error);
            throw new Error('Failed to generate PV PDF');
        }
    }

    /**
     * Map decision code to CSS class
     */
    private getDecisionClass(decision: string): string {
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

    /**
     * Prepare data for PV generation
     */
    preparePVData(
        school: any,
        classData: any,
        term: any,
        results: any[],
        prefetName: string,
        modifiedCount: number
    ): PVData {
        // Count decisions
        const counts = {
            admitted: 0,
            distinction: 0,
            greatDistinction: 0,
            adjourned: 0,
            failed: 0,
            medical: 0,
        };

        results.forEach((r) => {
            switch (r.decision) {
                case 'ADMITTED':
                    counts.admitted++;
                    break;
                case 'DISTINCTION':
                    counts.distinction++;
                    break;
                case 'GREAT_DISTINCTION':
                    counts.greatDistinction++;
                    break;
                case 'ADJOURNED':
                    counts.adjourned++;
                    break;
                case 'FAILED':
                    counts.failed++;
                    break;
                case 'MEDICAL':
                    counts.medical++;
                    break;
            }
        });

        const totalAdmitted = counts.admitted + counts.distinction + counts.greatDistinction;
        const totalStudents = results.length;

        // Prepare students data
        const students = results.map((r) => ({
            rank: r.rank,
            studentName: r.student.nom + ' ' + r.student.postNom + (r.student.prenom ? ' ' + r.student.prenom : ''),
            average: r.generalAverage.toFixed(2),
            points: r.totalPoints.toFixed(0),
            decisionLabel: (DELIB_DECISIONS as any)[r.decision]?.label || r.decision,
            decisionClass: this.getDecisionClass(r.decision),
            justification: r.justification || undefined,
        }));

        return {
            schoolName: school.name,
            province: school.province || 'Nord-Kivu',
            ville: school.ville || 'Goma',
            className: classData.name,
            sectionName: classData.section.name,
            termLabel: term.label,
            academicYear: term.academicYear.label,
            date: new Date().toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }),
            prefetName,
            totalStudents,
            totalAdmitted,
            successRate: ((totalAdmitted / totalStudents) * 100).toFixed(0),
            countAdmitted: counts.admitted,
            countDistinction: counts.distinction,
            countGreatDistinction: counts.greatDistinction,
            countAdjourned: counts.adjourned,
            countFailed: counts.failed,
            countMedical: counts.medical,
            adjournedRate: ((counts.adjourned / totalStudents) * 100).toFixed(0),
            failedRate: ((counts.failed / totalStudents) * 100).toFixed(0),
            modifiedDecisions: modifiedCount,
            students,
            generatedAt: new Date().toLocaleString('fr-FR'),
        };
    }
}

export const deliberationPdfService = new DeliberationPdfService();
