import { Request, Response } from 'express';
import * as schoolService from './school.service';
import { z } from 'zod';
import { optimizeSchoolLogo } from '../../../lib/upload/imageOptimizer';

export const getSchoolInfo = async (req: Request, res: Response) => {
    try {
        const school = await schoolService.getSchool();
        if (!school) {
            return res.status(404).json({
                error: 'SCHOOL_NOT_FOUND',
                message: "Aucune école configurée. Veuillez compléter la configuration initiale."
            });
        }
        res.json({ school });
    } catch (error) {
        console.error("Erreur gérée:", error);
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Erreur serveur interne" });
    }
};

export const updateSchoolInfo = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        
        // Zod validation on backend is highly recommended. 
        // We will just pass the request to the service to handle and return
        // assuming client sent right data, but normally we'd validate here.
        
        let logoUrls = undefined;

        if (req.file) {
            try {
                logoUrls = await optimizeSchoolLogo(req.file);
            } catch (err: any) {
                return res.status(400).json({ error: 'FILE_ERROR', message: err.message });
            }
        }

        const updatedSchool = await schoolService.updateSchool(data, logoUrls);
        
        return res.json({
            message: "Informations de l'école mises à jour avec succès",
            school: updatedSchool,
            logoUrls
        });
        
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'VALIDATION_ERROR',
                message: "Données invalides",
                details: error.issues.map(i => ({ field: i.path.join('.'), message: i.message }))
            });
        }
        console.error("Erreur serveur:", error);
        res.status(500).json({ error: "INTERNAL_ERROR", message: "Erreur lors de la mise à jour." });
    }
};
