import ExcelJS from 'exceljs';

/**
 * Create an Excel workbook from data
 */
export async function createExcelWorkbook(
    sheetName: string,
    columns: Array<{ header: string; key: string; width: number }>,
    rows: Record<string, unknown>[],
): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'EduGoma 360';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = columns;

    // Style header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1B5E20' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };

    // Add data rows
    for (const row of rows) {
        worksheet.addRow(row);
    }

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
        if (column.width && column.width < 10) {
            column.width = 10;
        }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}

/**
 * Parse an Excel file and return rows as objects
 */
export async function parseExcelFile(
    buffer: Buffer,
    sheetName?: string,
): Promise<Record<string, unknown>[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const worksheet = sheetName
        ? workbook.getWorksheet(sheetName)
        : workbook.worksheets[0];

    if (!worksheet) {
        throw new Error(`Feuille "${sheetName ?? 'default'}" introuvable`);
    }

    const rows: Record<string, unknown>[] = [];
    const headers: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
            row.eachCell((cell) => {
                headers.push(String(cell.value ?? ''));
            });
        } else {
            const rowData: Record<string, unknown> = {};
            row.eachCell((cell, colNumber) => {
                const header = headers[colNumber - 1];
                if (header) {
                    rowData[header] = cell.value;
                }
            });
            rows.push(rowData);
        }
    });

    return rows;
}
