import JsBarcode from 'jsbarcode';
import { createCanvas } from '@napi-rs/canvas';

/**
 * Generate a barcode as a data URL
 * @param text - Text to encode in the barcode (e.g., matricule)
 * @returns Data URL of the barcode image
 */
export function generateBarcodeDataUrl(text: string): string {
    const canvas = createCanvas(600, 100); // 600x100px at 300 DPI

    JsBarcode(canvas, text, {
        format: 'CODE128',
        displayValue: false, // No text below the barcode
        width: 2,
        height: 80,
        margin: 10,
        background: '#ffffff',
        lineColor: '#000000',
    });

    return canvas.toDataURL('image/png');
}

/**
 * Generate a barcode as a buffer
 * @param text - Text to encode in the barcode
 * @returns Buffer of the barcode image
 */
export function generateBarcodeBuffer(text: string): Buffer {
    const canvas = createCanvas(600, 100);

    JsBarcode(canvas, text, {
        format: 'CODE128',
        displayValue: false,
        width: 2,
        height: 80,
        margin: 10,
        background: '#ffffff',
        lineColor: '#000000',
    });

    return canvas.toBuffer('image/png');
}
