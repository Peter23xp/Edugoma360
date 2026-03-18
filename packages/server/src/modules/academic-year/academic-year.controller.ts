import { Request, Response } from 'express';
import * as service from './academic-year.service';

export const getAcademicYears = async (req: Request, res: Response) => {
    try {
        const schoolId = req.user?.schoolId;
        if (!schoolId) return res.status(403).json({ error: 'UNAUTHORIZED' });

        const data = await service.getAcademicYears(schoolId);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createAcademicYear = async (req: Request, res: Response) => {
    try {
        const schoolId = req.user?.schoolId;
        if (!schoolId) return res.status(403).json({ error: 'UNAUTHORIZED' });

        const newYear = await service.createAcademicYear(schoolId, req.body);
        res.status(201).json({ academicYear: newYear });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const closeAcademicYear = async (req: Request, res: Response) => {
    try {
        const schoolId = req.user?.schoolId;
        const userId = req.user?.id;
        if (!schoolId || !userId) return res.status(403).json({ error: 'UNAUTHORIZED' });

        const result = await service.closeAcademicYear(schoolId, req.params.id, userId, req.body.ignoreUnpaidDebts);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateAcademicYear = async (req: Request, res: Response) => {
    try {
        const schoolId = req.user?.schoolId;
        const id = req.params.id;
        if (!schoolId) return res.status(403).json({ error: 'UNAUTHORIZED' });

        const data = await service.updateAcademicYear(schoolId, id, req.body);
        res.json({ academicYear: data });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
