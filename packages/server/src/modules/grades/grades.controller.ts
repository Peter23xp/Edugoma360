import { Request, Response, NextFunction } from 'express';
import { gradesService } from './grades.service';
import { CreateGradeDto, BatchGradeDto, GradeQueryDto } from './grades.dto';

export class GradesController {
    async getGrades(req: Request, res: Response, next: NextFunction) {
        try {
            const query = GradeQueryDto.parse(req.query);
            const grades = await gradesService.getGrades(query);
            res.json({ data: grades });
        } catch (error) { next(error); }
    }

    async createGrade(req: Request, res: Response, next: NextFunction) {
        try {
            const data = CreateGradeDto.parse(req.body);
            const grade = await gradesService.createOrUpdateGrade(data, req.user!.userId);
            res.status(201).json({ data: grade });
        } catch (error) { next(error); }
    }

    async batchSaveGrades(req: Request, res: Response, next: NextFunction) {
        try {
            const data = BatchGradeDto.parse(req.body);
            const grades = await gradesService.batchSaveGrades(data, req.user!.userId);
            res.json({ data: grades });
        } catch (error) { next(error); }
    }

    async calculateAverages(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, termId } = req.params;
            const results = await gradesService.calculateAverages(classId, termId);
            res.json({ data: results });
        } catch (error) { next(error); }
    }

    async lockGrades(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, termId } = req.params;
            const result = await gradesService.lockGrades(classId, termId);
            res.json({ data: result });
        } catch (error) { next(error); }
    }
}

export const gradesController = new GradesController();
