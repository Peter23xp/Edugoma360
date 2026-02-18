import { Request, Response, NextFunction } from 'express';
import { calendarService } from './calendar.service';

export class CalendarController {
  async getUpcoming(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolId = req.user!.schoolId;
      const result = await calendarService.getUpcomingEvents(schoolId);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const calendarController = new CalendarController();
