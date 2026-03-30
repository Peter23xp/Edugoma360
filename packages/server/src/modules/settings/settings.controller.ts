import { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service';
import { ApiError } from '../../middleware/errorHandler.middleware';

export class SettingsController {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await settingsService.getAll(req.user!.schoolId);
            res.json({ data: settings });
        } catch (error) {
            next(error);
        }
    }

    async updateSetting(req: Request, res: Response, next: NextFunction) {
        try {
            const setting = await settingsService.set(
                req.user!.schoolId, req.params.key, req.body.value,
            );
            res.json({ data: setting });
        } catch (error) {
            next(error);
        }
    }

    async getAcademicYears(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user || !req.user.schoolId) {
                console.error('[SETTINGS] No schoolId found in request user context');
                throw new ApiError('Contexte école manquant', 400);
            }
            
            console.log(`[SETTINGS] Requesting academic years for school: ${req.user.schoolId}`);
            const years = await settingsService.getAcademicYears(req.user.schoolId);
            
            // Returns the array directly or wrapped?
            // Existing client code seems to expect the array in (await api.get(...)).data
            // If the controller returns { data: years }, then (resp).data is { data: years }.
            // So the frontend useQuery 'data' becomes { data: years }.
            // To fix this without breaking other things, let's keep the envelope but be aware.
            res.json({ data: years, success: true });
        } catch (error: any) {
            console.error('[SETTINGS] Controller error:', error?.message || error);
            next(error);
        }
    }

    async createAcademicYear(req: Request, res: Response, next: NextFunction) {
        try {
            const year = await settingsService.createAcademicYear(req.user!.schoolId, req.body);
            res.status(201).json({ data: year });
        } catch (error) {
            next(error);
        }
    }

    async activateAcademicYear(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) throw new ApiError('ID de l\'année académique manquant', 400);
            const year = await settingsService.activateAcademicYear(req.user!.schoolId, id);
            res.json({ data: year });
        } catch (error) {
            next(error);
        }
    }

    async getClasses(req: Request, res: Response, next: NextFunction) {
        try {
            const classes = await settingsService.getClasses(
                req.user!.schoolId,
                req.user!.role,
                req.user!.userId,
            );
            res.json({ data: classes });
        } catch (error) {
            next(error);
        }
    }

    async getSubjects(req: Request, res: Response, next: NextFunction) {
        try {
            const subjects = await settingsService.getSubjects(req.user!.schoolId);
            res.json({ data: subjects });
        } catch (error) {
            next(error);
        }
    }

    async getContext(req: Request, res: Response, next: NextFunction) {
        try {
            const context = await settingsService.getContext(req.user!.schoolId);
            res.json({ data: context });
        } catch (error) {
            next(error);
        }
    }

    async getTerms(req: Request, res: Response, next: NextFunction) {
        try {
            const terms = await settingsService.getTerms(req.user!.schoolId);
            res.json({ data: terms });
        } catch (error) {
            next(error);
        }
    }

    async getSections(req: Request, res: Response, next: NextFunction) {
        try {
            const sections = await settingsService.getSections(req.user!.schoolId);
            res.json({ data: sections });
        } catch (error) {
            next(error);
        }
    }
}

export const settingsController = new SettingsController();
