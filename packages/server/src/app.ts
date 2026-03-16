import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { corsOptions } from './config/cors';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import studentsRoutes from './modules/students/students.routes';
import classesRoutes from './modules/classes/classes.routes';
import timetableRoutes from './modules/timetable/timetable.routes';
import gradesRoutes from './modules/grades/grades.routes';
import deliberationRoutes from './modules/deliberation/deliberation.routes';
import financeRoutes from './modules/finance/finance.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import teachersRoutes from './modules/teachers/teachers.routes';
import smsRoutes from './modules/sms/sms.routes';
import reportsRoutes from './modules/reports/reports.routes';
import syncRoutes from './modules/sync/sync.routes';
import settingsRoutes from './modules/settings/settings.routes';
import statsRoutes from './modules/stats/stats.routes';
import alertsRoutes from './modules/alerts/alerts.routes';
import calendarRoutes from './modules/calendar/calendar.routes';
import bulletinsRoutes from './modules/bulletins/bulletins.routes';
import assignmentsRoutes from './modules/assignments/assignments.routes';
import absencesRoutes from './modules/absences/absences.routes';
import feesRoutes from './modules/fees/fees.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import debtsRoutes from './modules/payments/debts.routes';
import cashSessionsRoutes from './modules/cash-sessions/cash-sessions.routes';
import budgetsRoutes from './modules/budgets/budgets.routes';

const app = express();

// â”€â”€ Global Middleware â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use(helmet());
app.use(corsOptions);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(apiLimiter);

// â”€â”€ Static Files (uploads) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use('/uploads', express.static(path.join(__dirname, '..', '..', '..', 'uploads')));

// â”€â”€ Health Check â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        name: 'EduGoma 360 API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

// â”€â”€ API Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/deliberation', deliberationRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/bulletin', bulletinsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/absences', absencesRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/debts', debtsRoutes);
app.use('/api/cash-sessions', cashSessionsRoutes);
app.use('/api/budgets', budgetsRoutes);

// â”€â”€ 404 Handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use((_req, res) => {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: 'Route non trouvée',
        },
    });
});

// â”€â”€ Error Handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use(errorHandler);

export default app;
