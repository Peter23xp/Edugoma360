import prisma from '../../lib/prisma';
import { generatePdf, loadTemplate } from '../../lib/pdf';
import { gradesService } from '../grades/grades.service';
import { formatFC } from '@edugoma360/shared';

export class ReportsService {
  async generateBulletin(studentId: string, termId: string, schoolId: string): Promise<Buffer> {
    const student = await prisma.student.findFirst({
      where: { id: studentId, schoolId },
      include: {
        enrollments: {
          where: { academicYear: { isActive: true } },
          include: { class: { include: { section: true } }, academicYear: true },
          take: 1,
        },
      },
    });
    if (!student) throw new Error('Élève non trouvé');

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new Error('École non trouvée');

    const term = await prisma.term.findUnique({ where: { id: termId }, include: { academicYear: true } });
    if (!term) throw new Error('Trimestre non trouvé');

    const enrollment = student.enrollments[0];
    if (!enrollment) throw new Error('Inscription non trouvée');

    // Get averages — calculateAverages now requires 3 args and returns { averages, subjects, isValidated }
    const { averages: classResults } = await gradesService.calculateAverages(
      enrollment.classId,
      termId,
      schoolId,
    );
    const studentResult = classResults.find((r: any) => r.studentId === studentId);

    // Build subjects table rows
    const subjectRows = studentResult?.subjectAverages.map((sa: any) => `
      <tr>
        <td>${sa.subjectName}</td>
        <td class="center">${sa.coefficient ?? '—'}</td>
        <td class="center">${sa.interro ?? '-'}</td>
        <td class="center">${sa.tp ?? '-'}</td>
        <td class="center">${sa.exam ?? '-'}</td>
        <td class="center">${(sa.average * (sa.coefficient ?? 1)).toFixed(1)}</td>
        <td class="center bold">${sa.average.toFixed(2)}/20</td>
      </tr>
    `).join('') ?? '';

    const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #000; }
        .bulletin { width: 210mm; min-height: 297mm; padding: 10mm; }
        .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .header h1 { font-size: 16pt; text-transform: uppercase; }
        .header h2 { font-size: 12pt; margin-top: 3px; }
        .header p { font-size: 10pt; }
        .republic { font-size: 9pt; margin-bottom: 5px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin: 10px 0; font-size: 10pt; }
        .info-grid span { padding: 2px 0; }
        .bold { font-weight: bold; }
        .center { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #000; padding: 4px 6px; font-size: 10pt; }
        th { background: #e8e8e8; font-weight: bold; text-align: center; }
        .summary { margin-top: 15px; font-size: 11pt; }
        .summary .row { display: flex; justify-content: space-between; padding: 3px 0; }
        .decision { font-size: 14pt; font-weight: bold; text-align: center; margin: 15px 0; padding: 8px; border: 2px solid #000; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 40px; text-align: center; }
        .signatures div { padding-top: 50px; border-top: 1px solid #000; }
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .bulletin { padding: 5mm; }
        }
      </style>
    </head>
    <body>
      <div class="bulletin">
        <div class="republic">RÉPUBLIQUE DÉMOCRATIQUE DU CONGO — Ministère de l'EPSP</div>
        <div class="header">
          <h1>${school.name}</h1>
          <h2>BULLETIN SCOLAIRE</h2>
          <p>${school.province} — ${school.ville}${school.commune ? ' — ' + school.commune : ''}</p>
          <p>N° Agrément: ${school.agrement ?? 'N/A'} | Tél: ${school.telephone ?? 'N/A'}</p>
        </div>
        
        <div class="info-grid">
          <span><strong>Élève :</strong> ${student.nom.toUpperCase()} ${student.postNom.toUpperCase()} ${student.prenom ?? ''}</span>
          <span><strong>Matricule :</strong> ${student.matricule}</span>
          <span><strong>Classe :</strong> ${enrollment.class.name} — ${enrollment.class.section.name}</span>
          <span><strong>Année académique :</strong> ${term.academicYear.label}</span>
          <span><strong>Trimestre :</strong> ${term.label}</span>
          <span><strong>Sexe :</strong> ${student.sexe === 'M' ? 'Masculin' : 'Féminin'}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Matière</th>
              <th>Coeff</th>
              <th>Inter.</th>
              <th>TP</th>
              <th>Examen</th>
              <th>Total Pts</th>
              <th>Moyenne</th>
            </tr>
          </thead>
          <tbody>
            ${subjectRows}
          </tbody>
        </table>

        <div class="summary">
          <div class="row"><span>Moyenne Générale :</span><strong>${studentResult?.generalAverage.toFixed(2) ?? 'N/A'} / 20</strong></div>
          <div class="row"><span>Total Points :</span><strong>${studentResult?.totalPoints.toFixed(1) ?? 'N/A'}</strong></div>
          <div class="row"><span>Rang :</span><strong>${studentResult?.rank ?? 'N/A'} / ${classResults.length}</strong></div>
        </div>

        <div class="decision">
          DÉCISION : ${(() => {
        const d = studentResult?.hasEliminatoryFailure ? 'FAILED'
          : (studentResult?.generalAverage ?? 0) >= 16 ? 'GREAT_DISTINCTION'
            : (studentResult?.generalAverage ?? 0) >= 14 ? 'DISTINCTION'
              : (studentResult?.generalAverage ?? 0) >= 10 ? 'ADMITTED'
                : (studentResult?.generalAverage ?? 0) >= 8 ? 'ADJOURNED'
                  : 'FAILED';
        return d === 'ADMITTED' ? 'ADMIS'
          : d === 'DISTINCTION' ? 'ADMIS AVEC DISTINCTION'
            : d === 'GREAT_DISTINCTION' ? 'ADMIS AVEC GRANDE DISTINCTION'
              : d === 'ADJOURNED' ? 'AJOURNÉ' : 'REFUSÉ';
      })()}
        </div>

        <div class="signatures">
          <div>Le Préfet des Études</div>
          <div>Cachet de l'école</div>
          <div>Signature Parent/Tuteur</div>
        </div>
      </div>
    </body>
    </html>`;

    return generatePdf(html);
  }

  async generatePalmares(classId: string, termId: string, schoolId: string): Promise<Buffer> {
    const { averages: results } = await gradesService.calculateAverages(classId, termId, schoolId);

    const [classInfo, school, term] = await Promise.all([
      prisma.class.findUnique({ where: { id: classId }, include: { section: true } }),
      prisma.school.findUnique({ where: { id: schoolId } }),
      prisma.term.findUnique({ where: { id: termId }, include: { academicYear: true } }),
    ]);

    const rows = results.map((r: any) => `
      <tr>
        <td class="center">${r.rank}</td>
        <td>${r.studentName}</td>
        <td class="center">${r.totalPoints.toFixed(1)}</td>
        <td class="center bold">${r.generalAverage.toFixed(2)}</td>
        <td class="center">${r.hasEliminatoryFailure ? 'REFUSÉ' : r.generalAverage >= 10 ? 'ADMIS' : 'AJOURNÉ'}</td>
      </tr>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8">
    <style>
      body { font-family: 'Times New Roman', serif; font-size: 11pt; padding: 15mm; }
      h1 { text-align: center; font-size: 16pt; }
      h2 { text-align: center; font-size: 13pt; margin-bottom: 15px; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { border: 1px solid #000; padding: 5px 8px; font-size: 10pt; }
      th { background: #ddd; } .center { text-align: center; } .bold { font-weight: bold; }
    </style></head>
    <body>
      <h1>${school?.name ?? ''} — PALMARÈS</h1>
      <h2>Classe: ${classInfo?.name ?? ''} | ${term?.label ?? ''} | ${term?.academicYear.label ?? ''}</h2>
      <table>
        <thead><tr><th>Rang</th><th>Nom de l'Élève</th><th>Total Pts</th><th>Moyenne</th><th>Décision</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body></html>`;

    return generatePdf(html);
  }

  async generateReceipt(paymentId: string): Promise<Buffer> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        student: true,
        feeType: true,
        school: true,
        academicYear: true,
      },
    });
    if (!payment) throw new Error('Paiement non trouvé');

    const html = `
    <!DOCTYPE html>
    <html lang="fr"><head><meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; font-size: 11pt; padding: 20mm; }
      .receipt { border: 2px solid #000; padding: 20px; max-width: 400px; margin: 0 auto; }
      h2 { text-align: center; border-bottom: 1px solid #000; padding-bottom: 8px; }
      .row { display: flex; justify-content: space-between; padding: 5px 0; }
      .total { font-size: 14pt; font-weight: bold; border-top: 2px solid #000; padding-top: 8px; margin-top: 10px; }
    </style></head>
    <body>
      <div class="receipt">
        <h2>${payment.school.name}<br>REÇU DE PAIEMENT</h2>
        <div class="row"><span>N° Reçu:</span><strong>${payment.receiptNumber}</strong></div>
        <div class="row"><span>Date:</span><span>${new Date(payment.paidAt).toLocaleDateString('fr-CD')}</span></div>
        <div class="row"><span>Élève:</span><span>${payment.student.nom} ${payment.student.postNom}</span></div>
        <div class="row"><span>Matricule:</span><span>${payment.student.matricule}</span></div>
        <div class="row"><span>Type de frais:</span><span>${payment.feeType.name}</span></div>
        <div class="row"><span>Mode:</span><span>${payment.paymentMode}</span></div>
        <div class="row total"><span>Montant Payé:</span><span>${formatFC(payment.amountPaid)}</span></div>
        <p style="text-align:center;margin-top:20px;font-size:9pt">Merci — ${payment.school.name}</p>
      </div>
    </body></html>`;

    return generatePdf(html, { format: 'A4' });
  }
}

export const reportsService = new ReportsService();
