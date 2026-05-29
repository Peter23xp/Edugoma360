import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { EmailController } from './email.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const ALLOWED_MIMETYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const uploadDir = path.join(process.cwd(), 'uploads', 'email-attachments');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`));
    }
  },
});

const router = Router();
router.use(authenticate);

router.post('/send', upload.array('attachments', 3), EmailController.sendCampaign);
router.get('/history', EmailController.getHistory);

export { router as emailRoutes };
