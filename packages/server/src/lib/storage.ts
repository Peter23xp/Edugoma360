import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure upload directories exist
const uploadRoot = path.join(process.cwd(), '..', '..', '..', 'uploads');
const dirs = [
    uploadRoot,
    path.join(uploadRoot, 'photos'),
    path.join(uploadRoot, 'certificates'),
    path.join(uploadRoot, 'documents'),
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'photo') {
            cb(null, path.join(uploadRoot, 'photos'));
        } else if (file.fieldname === 'certificate' || file.fieldname === 'files') {
            cb(null, path.join(uploadRoot, 'certificates'));
        } else {
            cb(null, path.join(uploadRoot, 'documents'));
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf|docx|doc/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error(`Error: File upload only supports the following filetypes: ${filetypes}`));
    }
});

/**
 * Get public URL for a stored file
 */
export function getPublicUrl(filename: string, fieldname: string): string {
    if (!filename) return '';
    const subDir = fieldname === 'photo' ? 'photos' : fieldname === 'certificate' ? 'certificates' : 'documents';
    return `/uploads/${subDir}/${filename}`;
}
