import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import { promises as fs } from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateBarcodeDataUrl } from '../../lib/barcode';
import { prisma } from '../../lib/prisma';

interface CardData {
    logoUrl: string;
    schoolName: string;
    province: string;
    address: string;
    ville: string;
    telephone: string;
    photoUrl: string;
    nom: string;
    postNom: string;
    prenom: string;
    matricule: string;
    className: string;
    dateNaissance: string;
    academicYear: string;
    barcodeDataUrl: string;
}

/**
 * Generate student ID card as PDF
 * @param studentId - Student ID
 * @param formatType - Output format (pdf or png)
 * @param side - Which side to generate (front, back, or both)
 * @returns Buffer containing the generated card
 */
export async function generateStudentCard(
    studentId: string,
    formatType: 'pdf' | 'png' = 'pdf',
    side: 'front' | 'back' | 'both' = 'both'
): Promise<Buffer> {
    // 1. Fetch student data
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            school: true,
            enrollments: {
                include: {
                    class: true,
                    academicYear: true,
                },
                where: {
                    academicYear: {
                        isActive: true,
                    },
                },
            },
        },
    });

    if (!student) {
        throw new Error('STUDENT_NOT_FOUND');
    }

    if (!student.enrollments || student.enrollments.length === 0) {
        throw new Error('NO_ENROLLMENT');
    }

    // 2. Prepare data for templates
    const enrollment = student.enrollments[0];
    const barcodeDataUrl = generateBarcodeDataUrl(student.matricule);

    const data: CardData = {
        logoUrl: student.school.logoUrl || 'https://via.placeholder.com/120x120?text=Logo',
        schoolName: student.school.name,
        province: student.school.province,
        address: student.school.adresse || 'Adresse non renseignée',
        ville: student.school.ville,
        telephone: student.school.telephone || 'N/A',
        photoUrl: student.photoUrl || 'https://via.placeholder.com/120x150?text=Photo',
        nom: student.nom,
        postNom: student.postNom,
        prenom: student.prenom || '',
        matricule: student.matricule,
        className: enrollment.class.name,
        dateNaissance: format(new Date(student.dateNaissance), 'dd/MM/yyyy', { locale: fr }),
        academicYear: enrollment.academicYear.label,
        barcodeDataUrl,
    };

    // 3. Compile HTML templates
    const frontTemplate = await fs.readFile(
        path.join(__dirname, 'templates/card-front.html'),
        'utf-8'
    );
    const backTemplate = await fs.readFile(
        path.join(__dirname, 'templates/card-back.html'),
        'utf-8'
    );

    const compiledFront = Handlebars.compile(frontTemplate);
    const compiledBack = Handlebars.compile(backTemplate);

    const frontHtml = compiledFront(data);
    const backHtml = compiledBack(data);

    // 4. Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Configure for ID card format
    await page.setViewport({
        width: 1011, // 85.6mm at 300 DPI
        height: 638, // 54mm at 300 DPI
        deviceScaleFactor: 2, // Retina for better quality
    });

    try {
        if (side === 'both') {
            // Generate front and back as 2 pages
            await page.setContent(frontHtml, { waitUntil: 'networkidle0' });
            const frontPdf = await page.pdf({
                width: '85.6mm',
                height: '54mm',
                printBackground: true,
                margin: { top: 0, right: 0, bottom: 0, left: 0 },
            });

            await page.setContent(backHtml, { waitUntil: 'networkidle0' });
            const backPdf = await page.pdf({
                width: '85.6mm',
                height: '54mm',
                printBackground: true,
                margin: { top: 0, right: 0, bottom: 0, left: 0 },
            });

            await browser.close();

            // Merge the 2 PDFs
            const merged = await mergePDFs([frontPdf, backPdf]);
            return merged;
        } else {
            // Generate single side
            const html = side === 'front' ? frontHtml : backHtml;
            await page.setContent(html, { waitUntil: 'networkidle0' });

            if (formatType === 'pdf') {
                const pdf = await page.pdf({
                    width: '85.6mm',
                    height: '54mm',
                    printBackground: true,
                    margin: { top: 0, right: 0, bottom: 0, left: 0 },
                });
                await browser.close();
                return pdf;
            } else {
                // PNG format
                const screenshot = await page.screenshot({
                    type: 'png',
                    omitBackground: false,
                    fullPage: true,
                });
                await browser.close();
                return screenshot as Buffer;
            }
        }
    } catch (error) {
        await browser.close();
        throw new Error('PDF_GENERATION_FAILED');
    }
}

/**
 * Merge multiple PDFs into one
 * @param pdfBuffers - Array of PDF buffers to merge
 * @returns Merged PDF buffer
 */
async function mergePDFs(pdfBuffers: Buffer[]): Promise<Buffer> {
    const mergedPdf = await PDFDocument.create();

    for (const buffer of pdfBuffers) {
        const pdf = await PDFDocument.load(buffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
    }

    const merged = await mergedPdf.save();
    return Buffer.from(merged);
}

/**
 * Get cached card or generate new one
 * @param studentId - Student ID
 * @param formatType - Output format
 * @param side - Which side to generate
 * @returns Buffer containing the card
 */
export async function getOrGenerateCard(
    studentId: string,
    formatType: 'pdf' | 'png' = 'pdf',
    side: 'front' | 'back' | 'both' = 'both'
): Promise<Buffer> {
    // For now, always generate fresh
    // TODO: Implement Redis caching
    return generateStudentCard(studentId, formatType, side);
}

/**
 * Invalidate card cache for a student
 * @param studentId - Student ID
 */
export async function invalidateCardCache(studentId: string): Promise<void> {
    // TODO: Implement Redis cache invalidation
    // await redis.del(`card:${studentId}`);
}
