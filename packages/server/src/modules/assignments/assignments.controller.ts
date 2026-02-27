import { Request, Response, NextFunction } from 'express';
import { assignmentsService } from './assignments.service';

export class AssignmentsController {
    /**
     * Get matrix data
     */
    async getMatrix(req: Request, res: Response, next: NextFunction) {
        try {
            const { academicYearId, sectionId, classId, searchTeacher } = req.query;

            if (!academicYearId) {
                return res.status(400).json({ error: { message: "Année académique requise" } });
            }

            const result = await assignmentsService.getMatrixData(req.user!.schoolId, {
                academicYearId: academicYearId as string,
                sectionId: sectionId as string,
                classId: classId as string,
                searchTeacher: searchTeacher as string,
            });

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Create or update assignment
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { teacherId, classId, subjectId, volumeHoraire, academicYearId } = req.body;

            if (!teacherId || !classId || !subjectId || !academicYearId) {
                return res.status(400).json({ error: { message: "Données manquantes" } });
            }

            const result = await assignmentsService.createAssignment(req.user!.schoolId, {
                teacherId, classId, subjectId, volumeHoraire, academicYearId
            }) as any;

            if (result.conflict) {
                return res.status(409).json(result);
            }

            res.status(201).json({ data: result.assignment });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Bulk assignment
     */
    async bulkAssign(req: Request, res: Response, next: NextFunction) {
        try {
            const { teacherId, subjectId, classes, academicYearId } = req.body;

            if (!teacherId || !subjectId || !classes || !academicYearId) {
                return res.status(400).json({ error: { message: "Données manquantes" } });
            }

            const result = await assignmentsService.bulkAssign(req.user!.schoolId, {
                teacherId, subjectId, classes, academicYearId
            });

            res.json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update existing assignment
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { teacherId, volumeHoraire } = req.body;

            const result = await assignmentsService.replaceTeacher(id, teacherId); // if teacherId else update volume
            // Let's refine simple update later if needed
            res.json({ data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Remove assignment
     */
    async remove(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await assignmentsService.removeAssignment(id);
            res.json({ data: { success: true } });
        } catch (error) {
            next(error);
        }
    }
}

export const assignmentsController = new AssignmentsController();
