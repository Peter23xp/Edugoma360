import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../../../middleware/auth.middleware';
import multer from 'multer';
import * as schoolController from './school.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'FORBIDDEN', message: 'Accès non autorisé' });
        }
        next();
    };
};

router.use(authenticate);

// Accessible by all authenticated users 
router.get('/', schoolController.getSchoolInfo);

// Seul le PRÉFET (ou ADMIN) peut m.a.j
router.put('/', 
  requireRole(['PREFET', 'ADMIN']), 
  upload.single('logoFile'), 
  schoolController.updateSchoolInfo
);

export default router;
