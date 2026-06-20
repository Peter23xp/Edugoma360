import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

// ── Excel Helpers ─────────────────────────────────────────────────────────────

export function createWorkbook(): ExcelJS.Workbook {
    const wb = new ExcelJS.Workbook();
    wb.creator  = 'EduGoma 360';
    wb.created  = new Date();
    return wb;
}

export function styleHeader(sheet: ExcelJS.Worksheet, cols: { header: string; key: string; width: number }[]): void {
    sheet.columns = cols;
    const headerRow = sheet.getRow(1);
    headerRow.font      = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D47A1' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height    = 20;
    headerRow.commit();
}

export function addTableRows(sheet: ExcelJS.Worksheet, rows: any[]): void {
    rows.forEach((r, i) => {
        const row = sheet.addRow(r);
        if (i % 2 === 1) {
            row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
        }
        row.commit();
    });
}

// ── PDF Helpers ───────────────────────────────────────────────────────────────

export function createPDF(): { doc: PDFKit.PDFDocument; stream: PassThrough } {
    const stream = new PassThrough();
    const doc    = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(stream);
    return { doc, stream };
}

export function pdfHeader(doc: PDFKit.PDFDocument, title: string, subtitle?: string): void {
    doc.rect(0, 0, doc.page.width, 80).fill('#0D47A1');
    doc.fill('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('EduGoma 360', 50, 20);
    doc.fontSize(11).font('Helvetica').text(title, 50, 48);
    doc.fill('#000000').moveDown(3);
    if (subtitle) {
        doc.fontSize(10).fillColor('#555').text(subtitle, { align: 'center' });
        doc.moveDown(1);
    }
}

export function pdfSection(doc: PDFKit.PDFDocument, title: string): void {
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0D47A1').text(title);
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke('#0D47A1');
    doc.moveDown(0.3);
    doc.font('Helvetica').fillColor('#000000').fontSize(10);
}

export function pdfRow(doc: PDFKit.PDFDocument, label: string, value: string | number): void {
    const y = doc.y;
    doc.fontSize(10).fillColor('#555').text(label, 50, y, { width: 200 });
    doc.fillColor('#000').text(String(value), 260, y, { width: 280 });
    doc.moveDown(0.4);
}

export function pdfTable(
    doc: PDFKit.PDFDocument,
    headers: string[],
    rows: string[][],
    colWidths?: number[],
): void {
    const pageW   = doc.page.width - 100;
    const widths  = colWidths ?? headers.map(() => pageW / headers.length);
    const rowH    = 20;
    let   x       = 50;
    let   y       = doc.y;

    // Header row
    doc.rect(50, y, pageW, rowH).fill('#0D47A1');
    headers.forEach((h, i) => {
        doc.fillColor('#fff').fontSize(8).font('Helvetica-Bold')
            .text(h, x + 3, y + 5, { width: widths[i] - 6, ellipsis: true });
        x += widths[i];
    });
    y += rowH;

    // Data rows
    rows.forEach((row, ri) => {
        if (y + rowH > doc.page.height - 60) { doc.addPage(); y = 50; }
        x = 50;
        if (ri % 2 === 0) doc.rect(50, y, pageW, rowH).fill('#F3F4F6');
        row.forEach((cell, i) => {
            doc.fillColor('#111').fontSize(8).font('Helvetica')
                .text(cell, x + 3, y + 5, { width: widths[i] - 6, ellipsis: true });
            x += widths[i];
        });
        y += rowH;
    });

    doc.y = y + 8;
    doc.fillColor('#000');
}
