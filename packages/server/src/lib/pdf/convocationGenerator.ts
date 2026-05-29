import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export interface ConvocationData {
  numero: string;
  dateEmission: Date;
  tuteur: {
    nom: string;
    qualite: string;
  };
  eleve: {
    nom: string;
    classe: string;
  };
  motif: string;
  details: string;
  dateRendezVous: Date;
  heureRendezVous: string;
  lieu: string;
  school: {
    nom: string;
    logoUrl?: string | null;
    adresse?: string | null;
  };
}

export async function generateConvocationPDF(data: ConvocationData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = 495; // largeur utile (595 - 2*50)

    // ── EN-TÊTE ──────────────────────────────────────────────────────────────
    let headerY = 50;

    const logoAbsPath = data.school.logoUrl
      ? path.join(process.cwd(), data.school.logoUrl.replace(/^\//, ''))
      : null;
    if (logoAbsPath && fs.existsSync(logoAbsPath)) {
      doc.image(logoAbsPath, 50, headerY, { width: 70, height: 70 });
      doc.fontSize(16).font('Helvetica-Bold')
        .text(data.school.nom, 130, headerY + 10, { width: W - 80 });
      if (data.school.adresse) {
        doc.fontSize(9).font('Helvetica')
          .text(data.school.adresse, 130, headerY + 32, { width: W - 80 });
      }
      doc.text('Goma, Nord-Kivu — République Démocratique du Congo', 130, headerY + 44, { width: W - 80 });
    } else {
      doc.fontSize(16).font('Helvetica-Bold')
        .text(data.school.nom, 50, headerY, { align: 'center', width: W });
      doc.fontSize(9).font('Helvetica')
        .text(data.school.adresse ?? 'Goma, Nord-Kivu — RDC', 50, headerY + 22, { align: 'center', width: W });
    }

    doc.moveDown(3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).stroke('#1B5E20');
    doc.moveDown(1.5);

    // ── TITRE ────────────────────────────────────────────────────────────────
    doc.fontSize(20).font('Helvetica-Bold')
      .fillColor('#1B5E20')
      .text('CONVOCATION', { align: 'center' });
    doc.fillColor('#000000');
    doc.moveDown(0.8);

    // Numéro et date
    doc.fontSize(10).font('Helvetica')
      .text(`N° : ${data.numero}`, 50)
      .text(`Date d'émission : ${formatDate(data.dateEmission)}`);

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke('#cccccc');
    doc.moveDown(1);

    // ── CORPS ────────────────────────────────────────────────────────────────
    doc.fontSize(11).font('Helvetica')
      .text('Nous avons l\'honneur de convoquer :');
    doc.moveDown(0.8);

    doc.fontSize(11).font('Helvetica-Bold').text(`${data.tuteur.qualite} : ${data.tuteur.nom}`);
    doc.font('Helvetica')
      .text(`Concernant l\'élève : ${data.eleve.nom}`)
      .text(`Classe : ${data.eleve.classe}`);

    doc.moveDown(1);
    doc.fontSize(12).font('Helvetica-Bold').text(`MOTIF : ${data.motif}`);
    doc.moveDown(0.5);

    doc.fontSize(11).font('Helvetica').text('Détails :');
    doc.text(data.details, { align: 'justify' });

    doc.moveDown(1);
    doc.fontSize(11).font('Helvetica-Bold')
      .text(`DATE : ${formatDateLong(data.dateRendezVous)}`)
      .text(`HEURE : ${data.heureRendezVous}`)
      .text(`LIEU : ${data.lieu}`);

    doc.moveDown(1.2);
    doc.fontSize(12).font('Helvetica-Bold')
      .fillColor('#C62828')
      .text('Votre présence est OBLIGATOIRE.', { align: 'center' });
    doc.fillColor('#000000');

    // ── SIGNATURE ────────────────────────────────────────────────────────────
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica')
      .text(`Fait à Goma, le ${formatDate(data.dateEmission)}`, 50);
    doc.text('Le Préfet des Études', 380, doc.y - 14);
    doc.moveDown(3);
    doc.text('________________________', 380);
    doc.fontSize(8).fillColor('#666666').text('(Signature + Cachet)', 380);
    doc.fillColor('#000000');

    // ── ACCUSÉ DE RÉCEPTION ───────────────────────────────────────────────────
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).dash(4, { space: 4 }).stroke('#999999');
    doc.undash();
    doc.moveDown(1);

    doc.fontSize(11).font('Helvetica-Bold').text('ACCUSÉ DE RÉCEPTION', { align: 'center' });
    doc.fontSize(9).font('Helvetica').fillColor('#555555').text('(À détacher et retourner signé)', { align: 'center' });
    doc.fillColor('#000000');
    doc.moveDown(1);

    doc.fontSize(10).font('Helvetica')
      .text('Je soussigné(e) ___________________________________ certifie avoir bien reçu cette convocation.');
    doc.moveDown(2);
    doc.text('Signature :                                                    Date : ____/____/______');

    doc.end();
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR');
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
