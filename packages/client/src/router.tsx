import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';

// Layout
import AppLayout from './components/layout/AppLayout';

// Auth
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard
import DashboardPage from './pages/dashboard/DashboardPage';

// Students
import StudentsListPage from './pages/students/StudentsListPage';
import StudentDetailPage from './pages/students/StudentDetailPage';
import StudentFormPage from './pages/students/StudentFormPage';
import StudentsImportPage from './pages/students/StudentsImportPage';

// Academic
import ClassesPage from './pages/academic/ClassesPage';
import TimetablePage from './pages/academic/TimetablePage';

// Grades
import GradeEntryPage from './pages/grades/GradeEntryPage';
import AveragesPage from './pages/grades/AveragesPage';
import DeliberationPage from './pages/grades/DeliberationPage';
import BulletinPage from './pages/grades/BulletinPage';

// Finance
import FinanceDashboard from './pages/finance/FinanceDashboard';
import PaymentFormPage from './pages/finance/PaymentFormPage';
import DebtsPage from './pages/finance/DebtsPage';

// Attendance
import DailyAttendancePage from './pages/attendance/DailyAttendancePage';
import AttendanceReportPage from './pages/attendance/AttendanceReportPage';

// Communication
import SendSMSPage from './pages/communication/SendSMSPage';
import ConvocationsPage from './pages/communication/ConvocationsPage';

// Parent Portal
import ParentHomePage from './pages/parent-portal/ParentHomePage';

// Reports
import ReportsPage from './pages/reports/ReportsPage';

// Settings
import SchoolSetupPage from './pages/settings/SchoolSetupPage';
import AcademicYearPage from './pages/settings/AcademicYearPage';
import SubjectsPage from './pages/settings/SubjectsPage';
import SyncPage from './pages/settings/SyncPage';

// Setup Wizard
import SetupWizardPage from './pages/setup/SetupWizardPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    if (!isAuthenticated) {
        const redirect = window.location.pathname;
        const params = redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : '';
        return <Navigate to={`/login${params}`} replace />;
    }
    return <>{children}</>;
}

export default function AppRouter() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Setup Wizard (Protected but outside AppLayout) */}
            <Route
                path="/setup"
                element={
                    <ProtectedRoute>
                        <SetupWizardPage />
                    </ProtectedRoute>
                }
            />

            {/* Protected */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />

                {/* Students */}
                <Route path="students" element={<StudentsListPage />} />
                <Route path="students/new" element={<StudentFormPage />} />
                <Route path="students/import" element={<StudentsImportPage />} />
                <Route path="students/:id" element={<StudentDetailPage />} />
                <Route path="students/:id/edit" element={<StudentFormPage />} />

                {/* Academic */}
                <Route path="classes" element={<ClassesPage />} />
                <Route path="timetable" element={<TimetablePage />} />

                {/* Grades */}
                <Route path="grades" element={<GradeEntryPage />} />
                <Route path="grades/averages" element={<AveragesPage />} />
                <Route path="grades/deliberation" element={<DeliberationPage />} />
                <Route path="grades/bulletin/:studentId" element={<BulletinPage />} />

                {/* Finance */}
                <Route path="finance" element={<FinanceDashboard />} />
                <Route path="finance/payment" element={<PaymentFormPage />} />
                <Route path="finance/debts" element={<DebtsPage />} />

                {/* Attendance */}
                <Route path="attendance" element={<DailyAttendancePage />} />
                <Route path="attendance/daily" element={<DailyAttendancePage />} />
                <Route path="attendance/report" element={<AttendanceReportPage />} />

                {/* Communication */}
                <Route path="sms" element={<SendSMSPage />} />
                <Route path="convocations" element={<ConvocationsPage />} />

                {/* Parent Portal */}
                <Route path="parent" element={<ParentHomePage />} />
                <Route path="parent/home" element={<ParentHomePage />} />

                {/* Reports */}
                <Route path="reports" element={<ReportsPage />} />

                {/* Settings */}
                <Route path="settings" element={<SchoolSetupPage />} />
                <Route path="settings/academic-year" element={<AcademicYearPage />} />
                <Route path="settings/subjects" element={<SubjectsPage />} />
                <Route path="settings/sync" element={<SyncPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}
