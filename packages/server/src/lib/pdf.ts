import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';

/**
 * Generate a PDF from an HTML string
 */
export async function generatePdf(
    html: string,
    options?: {
        format?: 'A4' | 'Letter';
        landscape?: boolean;
        printBackground?: boolean;
    },
): Promise<Buffer> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: options?.format ?? 'A4',
            landscape: options?.landscape ?? false,
            printBackground: options?.printBackground ?? true,
            margin: {
                top: '15mm',
                right: '10mm',
                bottom: '15mm',
                left: '10mm',
            },
        });

        return Buffer.from(pdfBuffer);
    } finally {
        await browser.close();
    }
}

/**
 * Load an HTML template and replace placeholders
 */
export async function loadTemplate(
    templateName: string,
    data: Record<string, string>,
): Promise<string> {
    const templatePath = path.join(
        __dirname,
        '..',
        'modules',
        'reports',
        'templates',
        `${templateName}.html`,
    );

    let html = await fs.readFile(templatePath, 'utf-8');

    for (const [key, value] of Object.entries(data)) {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return html;
}
