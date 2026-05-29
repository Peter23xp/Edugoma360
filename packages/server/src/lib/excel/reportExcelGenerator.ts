import ExcelJS from 'exceljs';

const PRIMARY = 'FF1B5E20';
const ACCENT = 'FFF57F17';
const HEADER_BG = 'FFE8F5E9';

export async function generateReportExcel(config: any, data: any): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'EduGoma 360';

  const school = config.school;

  switch (config.type) {
    case 'RESULTS':  addResultsSheets(wb, data, school); break;
    case 'PRESENCE': addPresenceSheets(wb, data, school); break;
    case 'FINANCE':  addFinanceSheets(wb, data, school); break;
    default:         addGenericSheet(wb, data, school); break;
  }

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

function styleHeader(row: ExcelJS.Row, bgColor = HEADER_BG) {
  row.eachCell(cell => {
    cell.font = { bold: true, color: { argb: PRIMARY } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } } };
    cell.alignment = { horizontal: 'center' };
  });
}

function addSchoolHeader(ws: ExcelJS.Worksheet, school: any, title: string) {
  ws.mergeCells('A1:G1');
  const t = ws.getCell('A1');
  t.value = `${school.nomCourt ?? school.name} — ${title}`;
  t.font = { bold: true, size: 14, color: { argb: PRIMARY } };
  t.alignment = { horizontal: 'center' };
  ws.addRow([]);
}

function addResultsSheets(wb: ExcelJS.Workbook, data: any, school: any) {
  const ws = wb.addWorksheet('Résultats');
  addSchoolHeader(ws, school, 'RÉSULTATS ACADÉMIQUES');
  const hdr = ws.addRow(['#', 'Nom', 'Postnom', 'Prénom', 'Classe', 'Moyenne', 'Décision']);
  styleHeader(hdr);
  ws.columns = [
    { width: 5 }, { width: 20 }, { width: 20 }, { width: 15 },
    { width: 12 }, { width: 10 }, { width: 12 },
  ];
  (data.students ?? []).forEach((s: any, i: number) => {
    const sGrades = (data.grades ?? []).filter((g: any) => g.studentId === s.id);
    const avg = sGrades.length > 0
      ? (sGrades.reduce((a: number, g: any) => a + (g.score / g.maxScore) * 20, 0) / sGrades.length).toFixed(1)
      : '—';
    const decision = parseFloat(String(avg)) >= 10 ? 'Admis' : 'Ajourné';
    const row = ws.addRow([i + 1, s.nom, s.postNom, s.prenom ?? '', s.enrollments?.[0]?.class?.name ?? '—', avg, decision]);
    if (parseFloat(String(avg)) < 10) row.getCell(7).font = { color: { argb: 'FFCC0000' } };
  });
}

function addPresenceSheets(wb: ExcelJS.Workbook, data: any, school: any) {
  const ws = wb.addWorksheet('Présences');
  addSchoolHeader(ws, school, 'RAPPORT DE PRÉSENCES');
  const hdr = ws.addRow(['#', 'Nom élève', 'Classe', 'Présences', 'Absences', 'Taux (%)']);
  styleHeader(hdr);
  ws.columns = [{ width: 5 }, { width: 25 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }];
  const attMap = new Map<string, { present: number; absent: number }>();
  (data.attendances ?? []).forEach((a: any) => {
    const cur = attMap.get(a.studentId) ?? { present: 0, absent: 0 };
    if (a.status === 'PRESENT') cur.present += a._count;
    else cur.absent += a._count;
    attMap.set(a.studentId, cur);
  });
  (data.students ?? []).forEach((s: any, i: number) => {
    const att = attMap.get(s.id) ?? { present: 0, absent: 0 };
    const total = att.present + att.absent;
    const rate = total > 0 ? ((att.present / total) * 100).toFixed(1) : '0';
    ws.addRow([i + 1, `${s.nom} ${s.postNom}`, s.enrollments?.[0]?.class?.name ?? '—', att.present, att.absent, rate]);
  });
}

function addFinanceSheets(wb: ExcelJS.Workbook, data: any, school: any) {
  const ws = wb.addWorksheet('Finance');
  addSchoolHeader(ws, school, 'BILAN FINANCIER');
  const hdr = ws.addRow(['#', 'Élève', 'Classe', 'Attendu (FC)', 'Payé (FC)', 'Reste (FC)', 'Statut']);
  styleHeader(hdr);
  ws.columns = [{ width: 5 }, { width: 25 }, { width: 12 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 12 }];
  const totalFee = (data.feeTypes ?? []).reduce((s: number, f: any) => s + f.amount, 0);
  const paidMap = new Map<string, number>();
  (data.payments ?? []).forEach((p: any) => paidMap.set(p.studentId, (paidMap.get(p.studentId) ?? 0) + p.amountPaid));
  (data.students ?? []).forEach((s: any, i: number) => {
    const paid = paidMap.get(s.id) ?? 0;
    const reste = Math.max(0, totalFee - paid);
    const statut = reste === 0 ? 'À jour' : paid > 0 ? 'Partiel' : 'Impayé';
    const row = ws.addRow([i + 1, `${s.nom} ${s.postNom}`, s.enrollments?.[0]?.class?.name ?? '—', totalFee, paid, reste, statut]);
    if (statut === 'Impayé') row.getCell(7).font = { color: { argb: 'FFCC0000' } };
    else if (statut === 'À jour') row.getCell(7).font = { color: { argb: 'FF1B5E20' } };
  });
}

function addGenericSheet(wb: ExcelJS.Workbook, data: any, school: any) {
  const ws = wb.addWorksheet('Données');
  addSchoolHeader(ws, school, 'RAPPORT');
  ws.addRow(['Rapport généré par EduGoma 360']);
}
