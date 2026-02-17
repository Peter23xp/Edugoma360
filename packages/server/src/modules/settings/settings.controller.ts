import { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service';

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
            const years = await settingsService.getAcademicYears(req.user!.schoolId);
            res.json({ data: years });
        } catch (error) {
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

    async getClasses(req: Request, res: Response, next: NextFunction) {
        try {
            const classes = await settingsService.getClasses(req.user!.schoolId);
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
}

export const settingsController = new SettingsController();
