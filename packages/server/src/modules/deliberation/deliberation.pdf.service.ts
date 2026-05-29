import PDFDocument from 'pdfkit';
import fs from 'fs/promises';
import path from 'path';
import { DELIB_DECISIONS } from '@edugoma360/shared/constants/decisions';

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
    countExcludedDebt: number;
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
    async generatePV(data: PVData): Promise<string> {
        const uploadsDir = path.join(process.cwd(), 'uploads', 'pv');
        await fs.mkdir(uploadsDir, { recursive: true });

        const filename = `pv_${data.className.replace(/\s+/g, '_')}_${data.termLabel.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        const filepath = path.join(uploadsDir, filename);

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const stream = require('fs').createWriteStream(filepath);
            doc.pipe(stream);

            // Header
            doc.fontSize(10).text(`République Démocratique du Congo`, { align: 'center' });
            doc.text(`Province du ${data.province}`, { align: 'center' });
            doc.text(`Ville de ${data.ville}`, { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(14).font('Helvetica-Bold').text(data.schoolName, { align: 'center' });
            doc.moveDown(1);

            // Title
            doc.fontSize(16).font('Helvetica-Bold')
                .text(`PROCÈS-VERBAL DE DÉLIBÉRATION`, { align: 'center' });
            doc.moveDown(0.3);
            doc.fontSize(11).font('Helvetica')
                .text(`${data.className} — Section ${data.sectionName}`, { align: 'center' });
            doc.text(`${data.termLabel} — Année scolaire ${data.academicYear}`, { align: 'center' });
            doc.moveDown(1);

            // Summary
            doc.fontSize(10).font('Helvetica-Bold').text('RÉSUMÉ :');
            doc.font('Helvetica').fontSize(9);
            doc.text(`  Total élèves : ${data.totalStudents}`);
            doc.text(`  Admis : ${data.totalAdmitted} (${data.successRate}%)`);
            doc.text(`    - Grande Distinction : ${data.countGreatDistinction}`);
            doc.text(`    - Distinction : ${data.countDistinction}`);
            doc.text(`    - Admis : ${data.countAdmitted}`);
            doc.text(`  Ajournés : ${data.countAdjourned} (${data.adjournedRate}%)`);
            doc.text(`  Échoués : ${data.countFailed} (${data.failedRate}%)`);
            if (data.countExcludedDebt > 0) doc.text(`  Exclus impayé : ${data.countExcludedDebt}`);
            if (data.countMedical > 0) doc.text(`  Cas médicaux : ${data.countMedical}`);
            if (data.modifiedDecisions > 0) doc.text(`  Décisions modifiées par le jury : ${data.modifiedDecisions}`);
            doc.moveDown(1);

            // Table header
            const tableTop = doc.y;
            const colWidths = [25, 155, 45, 45, 115, 110];
            const headers = ['#', 'Nom de l\'élève', 'Moy.', 'Pts', 'Décision', 'Justification'];

            doc.font('Helvetica-Bold').fontSize(8);
            let x = 50;
            headers.forEach((h, i) => {
                doc.text(h, x, tableTop, { width: colWidths[i], align: i < 2 ? 'left' : 'center' });
                x += colWidths[i];
            });

            doc.moveTo(50, tableTop + 12).lineTo(545, tableTop + 12).stroke();
            let y = tableTop + 16;

            // Table rows
            doc.font('Helvetica').fontSize(8);
            data.students.forEach((student) => {
                // Calculate row height based on longest text wrapping
                const justifText = student.justification || '';
                const decisionText = student.decisionLabel;
                const justifHeight = doc.heightOfString(justifText, { width: colWidths[5] - 4 });
                const decisionHeight = doc.heightOfString(decisionText, { width: colWidths[4] - 4 });
                const rowHeight = Math.max(14, justifHeight + 2, decisionHeight + 2);

                if (y + rowHeight > 750) {
                    doc.addPage();
                    y = 50;
                }

                x = 50;
                // Rank
                doc.text(String(student.rank), x, y, { width: colWidths[0], align: 'left' });
                x += colWidths[0];
                // Name
                doc.text(student.studentName, x, y, { width: colWidths[1], align: 'left' });
                x += colWidths[1];
                // Average
                doc.text(student.average, x, y, { width: colWidths[2], align: 'center' });
                x += colWidths[2];
                // Points
                doc.text(student.points, x, y, { width: colWidths[3], align: 'center' });
                x += colWidths[3];
                // Decision — wrap text
                doc.text(decisionText, x, y, { width: colWidths[4] - 4, align: 'center' });
                x += colWidths[4];
                // Justification — wrap text
                if (justifText) {
                    doc.fontSize(7).text(justifText, x, y, { width: colWidths[5] - 4, align: 'left' });
                    doc.fontSize(8);
                }

                y += rowHeight;
            });

            // Footer
            doc.moveDown(2);
            const footerY = Math.max(y + 30, 680);
            doc.fontSize(9).font('Helvetica')
                .text(`Fait à ${data.ville}, le ${data.date}`, 50, footerY);
            doc.moveDown(1.5);
            doc.font('Helvetica-Bold')
                .text(`Le Préfet des Études`, 350, footerY + 30);
            doc.font('Helvetica')
                .text(data.prefetName, 350, footerY + 45);

            doc.moveDown(2);
            doc.fontSize(7).font('Helvetica').fillColor('#888888')
                .text(`Document généré le ${data.generatedAt} — EduGoma 360`, 50, 780, { align: 'center' });

            doc.end();

            stream.on('finish', () => resolve(`/uploads/pv/${filename}`));
            stream.on('error', reject);
        });
    }

    preparePVData(
        school: any,
        classData: any,
        term: any,
        results: any[],
        prefetName: string,
        modifiedCount: number
    ): PVData {
        const counts = {
            admitted: 0, distinction: 0, greatDistinction: 0,
            adjourned: 0, failed: 0, excludedDebt: 0, medical: 0,
        };

        results.forEach((r) => {
            switch (r.decision) {
                case 'ADMITTED': counts.admitted++; break;
                case 'DISTINCTION': counts.distinction++; break;
                case 'GREAT_DISTINCTION': counts.greatDistinction++; break;
                case 'ADJOURNED': counts.adjourned++; break;
                case 'FAILED': counts.failed++; break;
                case 'EXCLUDED_DEBT': counts.excludedDebt++; break;
                case 'MEDICAL': counts.medical++; break;
            }
        });

        const totalAdmitted = counts.admitted + counts.distinction + counts.greatDistinction;
        const totalStudents = results.length;

        const students = results.map((r) => ({
            rank: r.rank,
            studentName: r.student.nom + ' ' + r.student.postNom + (r.student.prenom ? ' ' + r.student.prenom : ''),
            average: (r.generalAverage ?? 0).toFixed(2),
            points: (r.totalPoints ?? 0).toFixed(0),
            decisionLabel: (DELIB_DECISIONS as any)[r.decision]?.label || r.decision,
            decisionClass: r.decision.toLowerCase(),
            justification: r.justification || undefined,
        }));

        return {
            schoolName: school.name,
            province: school.province || 'Nord-Kivu',
            ville: school.ville || 'Goma',
            className: classData.name,
            sectionName: classData.section?.name || '',
            termLabel: term.label,
            academicYear: term.academicYear?.label || '',
            date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
            prefetName,
            totalStudents,
            totalAdmitted,
            successRate: totalStudents > 0 ? ((totalAdmitted / totalStudents) * 100).toFixed(0) : '0',
            countAdmitted: counts.admitted,
            countDistinction: counts.distinction,
            countGreatDistinction: counts.greatDistinction,
            countAdjourned: counts.adjourned,
            countFailed: counts.failed,
            countExcludedDebt: counts.excludedDebt,
            countMedical: counts.medical,
            adjournedRate: totalStudents > 0 ? ((counts.adjourned / totalStudents) * 100).toFixed(0) : '0',
            failedRate: totalStudents > 0 ? ((counts.failed / totalStudents) * 100).toFixed(0) : '0',
            modifiedDecisions: modifiedCount,
            students,
            generatedAt: new Date().toLocaleString('fr-FR'),
        };
    }
}

export const deliberationPdfService = new DeliberationPdfService();
