import { Request, Response, NextFunction } from 'express';
import { attendanceService } from './attendance.service';
import { BatchAttendanceDto } from './attendance.dto';

export class AttendanceController {
    async recordBatch(req: Request, res: Response, next: NextFunction) {
        try {
            const data = BatchAttendanceDto.parse(req.body);
            const result = await attendanceService.recordBatchAttendance(data, req.user!.userId);
            res.json({ data: result });
        } catch (error) { next(error); }
    }

    async getDailyAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, date, period } = req.query as any;
            const result = await attendanceService.getDailyAttendance(classId, date, period);
            res.json({ data: result });
        } catch (error) { next(error); }
    }

    async getReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { classId, termId } = req.params;
            const result = await attendanceService.getAttendanceReport(classId, termId);
            res.json({ data: result });
        } catch (error) { next(error); }
    }
}

export const attendanceController = new AttendanceController();
