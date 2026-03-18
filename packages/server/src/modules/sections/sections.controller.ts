import { Request, Response } from 'express';
import * as service from './sections.service';

export const getSections = async (req: Request, res: Response) => {
    try {
        const schoolId = req.user?.schoolId;
        if (!schoolId) return res.status(403).json({ error: 'UNAUTHORIZED' });

        const data = await service.getSections(schoolId);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createSection = async (req: Request, res: Response) => {
    try {
        const schoolId = req.user?.schoolId;
        if (!schoolId) return res.status(403).json({ error: 'UNAUTHORIZED' });

        const newSection = await service.createSection(schoolId, req.body);
        res.status(201).json({ section: newSection });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateSection = async (req: Request, res: Response) => {
    try {
        const schoolId = req.user?.schoolId;
        if (!schoolId) return res.status(403).json({ error: 'UNAUTHORIZED' });

        const updatedSection = await service.updateSection(schoolId, req.params.id, req.body);
        res.json({ section: updatedSection });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteSection = async (req: Request, res: Response) => {
    try {
        const schoolId = req.user?.schoolId;
        if (!schoolId) return res.status(403).json({ error: 'UNAUTHORIZED' });

        await service.deleteSection(schoolId, req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const addSubject = async (req: Request, res: Response) => {
    try {
        const schoolId = req.user?.schoolId;
        if (!schoolId) return res.status(403).json({ error: 'UNAUTHORIZED' });

        const newSubject = await service.addSubject(schoolId, req.params.id, req.body);
        res.status(201).json({ subject: newSubject });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateSubject = async (req: Request, res: Response) => {
    try {
        const schoolId = req.user?.schoolId;
        if (!schoolId) return res.status(403).json({ error: 'UNAUTHORIZED' });

        const updatedSubject = await service.updateSubject(
            schoolId, 
            req.params.sectionId, 
            req.params.subjectId, 
            req.body
        );
        res.json({ subject: updatedSubject });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const removeSubject = async (req: Request, res: Response) => {
    try {
        const schoolId = req.user?.schoolId;
        if (!schoolId) return res.status(403).json({ error: 'UNAUTHORIZED' });

        await service.removeSubject(schoolId, req.params.sectionId, req.params.subjectId);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
