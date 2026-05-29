import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

const REPORT_LABELS: Record<string, string> = {
  PRESENCE: 'RAPPORT DE PRÉSENCES',
  RESULTS: 'RAPPORT DE RÉSULTATS ACADÉMIQUES',
  FINANCE: 'RAPPORT FINANCIER',
  EFFECTIFS: "RAPPORT DES EFFECTIFS",
  END_OF_YEAR: "RAPPORT DE FIN D'ANNÉE",
  CUSTOM: 'RAPPORT PERSONNALISÉ',
};

export async function generateReportPDF(config: any, data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = 495;
    const school = config.school;
    const user = config.generatedBy;

    // ── Page de garde ────────────────────────────────────────────────────────
    if (config.options?.includeLogo && school.logoUrl) {
      const abs = path.join(process.cwd(), school.logoUrl.replace(/^\//, ''));
      if (fs.existsSync(abs)) {
        doc.image(abs, 225, 50, { width: 80, height: 80 });
        doc.moveDown(5);
      }
    }

    doc.fontSize(20).font('Helvetica-Bold').fillColor('#1B5E20')
      .text(school.nomCourt ?? school.name, { align: 'center' });
    doc.fillColor('#555').fontSize(10).font('Helvetica')
      .text(school.adresse ?? 'Goma, Nord-Kivu, RDC', { align: 'center' });

    doc.moveDown(3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(2).stroke('#1B5E20');
    doc.moveDown(2);

    doc.fontSize(18).font('Helvetica-Bold').fillColor('#000')
      .text(REPORT_LABELS[config.type] ?? 'RAPPORT', { align: 'center' });

    doc.moveDown(1);
    doc.fontSize(12).font('Helvetica').fillColor('#333')
      .text(config.name, { align: 'center' });

    doc.moveDown(3);
    doc.fontSize(10).font('Helvetica').fillColor('#666');
    doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
    doc.text(`Par : ${user.nom} ${user.postNom ?? ''} (${user.role})`, { align: 'center' });

    // ── Corps selon type ─────────────────────────────────────────────────────
    doc.addPage();

    switch (config.type) {
      case 'RESULTS':   addResultsSection(doc, data, W); break;
      case 'PRESENCE':  addPresenceSection(doc, data, W); break;
      case 'FINANCE':   addFinanceSection(doc, data, W); break;
      default:          addGenericSection(doc, data, W); break;
    }

    // ── Numérotation ─────────────────────────────────────────────────────────
    if (config.options?.includePageNumbers) {
      const pages = (doc as any).bufferedPageRange?.() ?? { start: 0, count: 1 };
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(pages.start + i);
        doc.fontSize(8).fillColor('#999')
          .text(`Page ${i + 1} / ${pages.count}`, 50, 810, { align: 'center', width: W });
      }
    }

    doc.end();
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sectionHeader(doc: any, title: string) {
  doc.moveDown(1);
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#1B5E20').text(title);
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke('#1B5E20');
  doc.moveDown(0.5);
  doc.fillColor('#000');
}

function addResultsSection(doc: any, data: any, W: number) {
  sectionHeader(doc, '1. RÉSULTATS ACADÉMIQUES');
  const { students = [], grades = [] } = data;
  const totalStudents = students.length;
  const avgScore = grades.length > 0
    ? (grades as any[]).reduce((s: number, g: any) => s + (g.score / g.maxScore) * 20, 0) / grades.length
    : 0;

  doc.fontSize(10).font('Helvetica');
  doc.text(`Total élèves : ${totalStudents}`);
  doc.text(`Moyenne générale : ${avgScore.toFixed(1)} / 20`);
  doc.text(`Nombre de notes saisies : ${grades.length}`);
}

function addPresenceSection(doc: any, data: any, W: number) {
  sectionHeader(doc, '1. PRÉSENCES');
  const { attendances = [] } = data;
  const present = (attendances as any[]).filter((a: any) => a.status === 'PRESENT').reduce((s: number, a: any) => s + a._count, 0);
  const total = (attendances as any[]).reduce((s: number, a: any) => s + a._count, 0);
  const rate = total > 0 ? ((present / total) * 100).toFixed(1) : '0';
  doc.fontSize(10).font('Helvetica');
  doc.text(`Taux de présence global : ${rate}%`);
  doc.text(`Total présences enregistrées : ${total}`);
}

function addFinanceSection(doc: any, data: any, W: number) {
  sectionHeader(doc, '1. BILAN FINANCIER');
  const { payments = [], feeTypes = [], students = [] } = data;
  const totalExpected = students.length * (feeTypes as any[]).reduce((s: number, f: any) => s + f.amount, 0);
  const totalCollected = (payments as any[]).reduce((s: number, p: any) => s + p.amountPaid, 0);
  doc.fontSize(10).font('Helvetica');
  doc.text(`Frais attendus : ${totalExpected.toLocaleString('fr-FR')} FC`);
  doc.text(`Frais collectés : ${totalCollected.toLocaleString('fr-FR')} FC`);
  doc.text(`Taux de collecte : ${totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : 0}%`);
}

function addGenericSection(doc: any, data: any, W: number) {
  sectionHeader(doc, '1. DONNÉES');
  doc.fontSize(10).font('Helvetica').text('Rapport généré avec les données disponibles.');
}
