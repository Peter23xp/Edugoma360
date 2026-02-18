import prisma from '../../lib/prisma';

export class CalendarService {
  async getUpcomingEvents(schoolId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get upcoming term events
    const terms = await prisma.term.findMany({
      where: {
        academicYear: { schoolId, isActive: true },
        OR: [
          { examStartDate: { gte: today } },
          { examEndDate: { gte: today } },
          { endDate: { gte: today } },
        ],
      },
      orderBy: { startDate: 'asc' },
      take: 5,
    });

    const events: any[] = [];

    terms.forEach((term) => {
      // Exam start
      if (term.examStartDate && term.examStartDate >= today) {
        const isToday = term.examStartDate.toDateString() === today.toDateString();
        events.push({
          id: `exam-start-${term.id}`,
          date: term.examStartDate.toISOString(),
          label: `Début des examens - ${term.label}`,
          type: 'exam',
          isToday,
        });
      }

      // Exam end
      if (term.examEndDate && term.examEndDate >= today) {
        const isToday = term.examEndDate.toDateString() === today.toDateString();
        events.push({
          id: `exam-end-${term.id}`,
          date: term.examEndDate.toISOString(),
          label: `Fin des examens - ${term.label}`,
          type: 'exam',
          isToday,
        });
      }

      // Term end (vacation)
      if (term.endDate >= today) {
        const isToday = term.endDate.toDateString() === today.toDateString();
        events.push({
          id: `vacation-${term.id}`,
          date: term.endDate.toISOString(),
          label: `Début des vacances - ${term.label}`,
          type: 'vacation',
          isToday,
        });
      }
    });

    // Sort by date and take first 5
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { events: events.slice(0, 5) };
  }
}

export const calendarService = new CalendarService();
