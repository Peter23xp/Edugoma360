import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { absencesService } from './absences.service';

export class AbsencesController {
    async getRequests(req: Request, res: Response) {
        try {
            const filters = req.query as any;
            const requests = await absencesService.getLeaveRequests(req.user!.schoolId, filters);
            res.json(requests);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async createRequest(req: Request, res: Response) {
        try {
            // If the user is an ENSEIGNANT, restrict to their own teacher profile
            if (req.user!.role === 'ENSEIGNANT') {
                const teacher = await prisma.teacher.findFirst({
                    where: {
                        userId: req.user!.id,
                        schoolId: req.user!.schoolId
                    },
                    select: { id: true }
                });

                if (!teacher) {
                    res.status(403).json({ message: 'Profil enseignant non trouvé pour ce compte' });
                    return;
                }
                req.body.teacherId = teacher.id;
            }

            const request = await absencesService.createLeaveRequest(req.user!.schoolId, req.body);
            res.status(201).json(request);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Validate observations mandatory on reject
            if (req.body.status === 'REJECTED' && !req.body.observations?.trim()) {
                res.status(400).json({ message: 'Les observations sont obligatoires en cas de refus' });
                return;
            }

            const updated = await absencesService.updateLeaveStatus(id, req.user!.id!, req.body);
            res.json(updated);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getStats(req: Request, res: Response) {
        try {
            const stats = await absencesService.getAbsenceStats(req.user!.schoolId);
            res.json(stats);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getMyBalance(req: Request, res: Response) {
        try {
            const teacher = await prisma.teacher.findFirst({
                where: {
                    userId: req.user!.id,
                    schoolId: req.user!.schoolId
                },
                select: { id: true, congeGlobal: true, congePris: true }
            });

            if (!teacher) {
                res.status(404).json({ message: 'Profil enseignant non trouvé' });
                return;
            }

            res.json({
                total: teacher.congeGlobal,
                pris: teacher.congePris,
                restants: teacher.congeGlobal - teacher.congePris
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}

export const absencesController = new AbsencesController();
