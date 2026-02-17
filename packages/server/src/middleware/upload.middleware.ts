import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { env } from '../config/env';
import { Request } from 'express';

// Ensure upload directory exists
const uploadDir = path.resolve(env.STORAGE_LOCAL_PATH);

async function ensureUploadDir() {
    try {
        await fs.access(uploadDir);
    } catch {
        await fs.mkdir(uploadDir, { recursive: true });
    }
}

ensureUploadDir();

// Multer storage config
const storage = multer.memoryStorage();

/**
 * Photo upload middleware (for student photos)
 * - Max 5MB
 * - Only JPEG, PNG, WebP
 * - Automatically resized to 400x400
 */
export const uploadPhoto = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format d\'image non supporté. Utilisez JPEG, PNG ou WebP.'));
        }
    },
});

/**
 * Excel upload middleware
 */
export const uploadExcel = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Format non supporté. Utilisez un fichier Excel (.xlsx).'));
        }
    },
});

/**
 * Process and save an uploaded photo
 * Resizes to 400x400 and converts to WebP for optimal size
 */
export async function processAndSavePhoto(
    buffer: Buffer,
    filename: string,
): Promise<string> {
    const outputFilename = `${filename}.webp`;
    const outputPath = path.join(uploadDir, 'photos', outputFilename);

    // Ensure photos directory exists
    await fs.mkdir(path.join(uploadDir, 'photos'), { recursive: true });

    await sharp(buffer)
        .resize(400, 400, { fit: 'cover', position: 'center' })
        .webp({ quality: 80 })
        .toFile(outputPath);

    return `/uploads/photos/${outputFilename}`;
}
