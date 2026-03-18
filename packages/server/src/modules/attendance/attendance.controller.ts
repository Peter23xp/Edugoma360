import { Request, Response, NextFunction } from 'express';
import { attendanceService } from './attendance.service';
import { BatchAttendanceDto, SaveDailyRollCallDto } from './attendance.dto';

export class AttendanceController {

    // ── Legacy batch (existing DailyAttendancePage) ───────────────────────────
    async recordBatch(req: Request, res: Response, next: NextFunction) {
        try {
            const data = BatchAttendanceDto.parse(req.body);
            const result = await attendanceService.recordBatchAttendance(data, req.user!.userId);
            res.json({ data: result });
        } catch (error) { next(error); }
    }

    // ── NEW: GET /attendance/daily — full roll call list with existing statuses
    async getDailyAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, date, period } = req.query as {
                classId?: string;
                date?: string;
                period?: string;
            };

            if (!classId || !date || !period) {
                res.status(400).json({ error: 'Paramètres classId, date et period requis' });
                return;
            }

            const result = await attendanceService.getDailyRollCall(classId, date, period);
            res.json({ data: result });
        } catch (error) { next(error); }
    }

    // ── NEW: POST /attendance/daily — save complete roll call
    async saveDailyRollCall(req: Request, res: Response, next: NextFunction) {
        try {
            const data = SaveDailyRollCallDto.parse(req.body);
            const result = await attendanceService.saveDailyRollCall(data, req.user!.userId);
            res.status(201).json({ data: result });
        } catch (error) { next(error); }
    }

    // ── Existing: report ──────────────────────────────────────────────────────
    async getReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, termId } = req.params;
            const result = await attendanceService.getAttendanceReport(classId, termId);
            res.json({ data: result });
        } catch (error) { next(error); }
    }

    // ── Existing: today rate ──────────────────────────────────────────────────
    async getTodayRate(req: Request, res: Response, next: NextFunction) {
        try {
            const schoolId = req.user!.schoolId;
            const result = await attendanceService.getTodayRate(schoolId);
            res.json({ data: result });
        } catch (error) { next(error); }
    }

    // ── NEW: GET /attendance/absences — Absence History (SCR-029) ──────────────
    async getAbsenceHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const schoolId = req.user!.schoolId;
            const result = await attendanceService.getAbsenceHistory(schoolId, req.query);
            res.json(result);
        } catch (error) { next(error); }
    }

    // ── NEW: GET /attendance/student/:studentId/stats — Student Stats ──────────
    async getStudentStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { studentId } = req.params;
            const result = await attendanceService.getStudentAbsenceStats(studentId);
            res.json(result);
        } catch (error) { next(error); }
    }

    // ── NEW: GET /attendance/reports/stats ──
    async getReportStats(req: Request, res: Response, next: NextFunction) {
        try {
            const schoolId = req.user!.schoolId;
            const result = await attendanceService.getReportStats(schoolId, req.query);
            res.json(result);
        } catch (error) { next(error); }
    }

    // ── NEW: GET /attendance/justifications ──
    async getJustifications(req: Request, res: Response, next: NextFunction) {
        try {
            const schoolId = req.user!.schoolId;
            const result = await attendanceService.getJustifications(schoolId, req.query);
            res.json(result);
        } catch (error) { next(error); }
    }

    // ── NEW: PUT /attendance/justifications/:id/approve ──
    async approveJustification(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { comment } = req.body;
            
            const result = await attendanceService.approveJustification(id, {
                comment,
                userId: req.user!.userId
            });
            res.json({ data: result });
        } catch (error) { next(error); }
    }

    // ── NEW: PUT /attendance/justifications/:id/reject ──
    async rejectJustification(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { rejectionReason, comment } = req.body;
            
            const result = await attendanceService.rejectJustification(id, {
                rejectionReason,
                comment,
                userId: req.user!.userId
            });
            res.json({ data: result });
        } catch (error) { next(error); }
    }
}

export const attendanceController = new AttendanceController();
