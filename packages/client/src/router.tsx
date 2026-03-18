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

// Teachers
import { TeachersListPage } from './pages/teachers/TeachersListPage';
import { TeacherDetailPage } from './pages/teachers/TeacherDetailPage';
import { TeacherFormPage } from './pages/teachers/TeacherFormPage';
import AssignmentsPage from './pages/teachers/AssignmentsPage';
import TeacherReportsPage from './pages/teachers/ReportsPage';
import AbsencesPage from './pages/teachers/AbsencesPage';

// Academic
import ClassesPage from './pages/academic/ClassesPage';
import TimetablePage from './pages/academic/TimetablePage';
import GradeEntryPage from './pages/academic/GradeEntryPage';
import ClassGradesPage from './pages/academic/ClassGradesPage';

// Grades
import AveragesPage from './pages/academic/AveragesPage';
import DeliberationPage from './pages/grades/DeliberationPage';
import PVPage from './pages/academic/PVPage';
import PalmaresPage from './pages/academic/PalmaresPage';
import AcademicBulletinPage from './pages/academic/BulletinPage';
import BulletinPage from './pages/grades/BulletinPage';

// Finance
import FinanceDashboard from './pages/finance/FinanceDashboard';
import { PaymentEntryPage } from './pages/finance/PaymentEntryPage';
import PaymentsHistoryPage from './pages/finance/PaymentsHistoryPage';
import DebtsPage from './pages/finance/DebtsPage';
import FeesConfigPage from './pages/finance/FeesConfigPage';
import FinanceReportsPage from './pages/finance/ReportsPage';
import CashierPage from './pages/finance/CashierPage';
import BudgetsPage from './pages/finance/BudgetsPage';

// Attendance
import AttendanceReportPage from './pages/attendance/AttendanceReportPage';
import DailyRollCallPage from './pages/attendance/DailyRollCallPage';
import AbsenceHistoryPage from './pages/attendance/AbsenceHistoryPage';
import JustificationsPage from './pages/attendance/JustificationsPage';

// Communication
import SendSMSPage from './pages/communication/SendSMSPage';
import ConvocationsPage from './pages/communication/ConvocationsPage';

// Parent Portal
import ParentHomePage from './pages/parent-portal/ParentHomePage';

// Reports
import ReportsPage from './pages/reports/ReportsPage';

// Settings
import SchoolInfoPage from './pages/settings/SchoolInfoPage';
import AcademicYearPage from './pages/settings/AcademicYearPage';
import SubjectsPage from './pages/settings/SubjectsPage';
import SectionsPage from './pages/settings/SectionsPage';
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

                {/* Teachers */}
                <Route path="teachers" element={<TeachersListPage />} />
                <Route path="teachers/new" element={<TeacherFormPage />} />
                <Route path="teachers/:id" element={<TeacherDetailPage />} />
                <Route path="teachers/:id/edit" element={<TeacherFormPage />} />
                <Route path="teachers/assignments" element={<AssignmentsPage />} />
                <Route path="teachers/reports" element={<TeacherReportsPage />} />
                <Route path="teachers/absences" element={<AbsencesPage />} />

                {/* Academic */}
                <Route path="classes" element={<ClassesPage />} />
                <Route path="classes/:classId/grades" element={<ClassGradesPage />} />
                <Route path="timetable" element={<TimetablePage />} />

                {/* Grades */}
                <Route path="grades" element={<GradeEntryPage />} />
                <Route path="grades/averages" element={<AveragesPage />} />
                <Route path="grades/deliberation" element={<DeliberationPage />} />
                <Route path="deliberation/pv" element={<PVPage />} />
                <Route path="palmares" element={<PalmaresPage />} />
                <Route path="grades/bulletin/:studentId" element={<BulletinPage />} />
                <Route path="grades/bulletin" element={<BulletinPage />} />
                <Route path="bulletin/batch" element={<BulletinPage />} />
                <Route path="bulletin/:studentId/:termId" element={<AcademicBulletinPage />} />
                <Route path="bulletin/:studentId" element={<AcademicBulletinPage />} />

                {/* Finance */}
                <Route path="finance" element={<FinanceDashboard />} />
                <Route path="finance/fees" element={<FeesConfigPage />} />
                <Route path="finance/payments" element={<PaymentsHistoryPage />} />
                <Route path="finance/payments/new" element={<PaymentEntryPage />} />
                <Route path="finance/debts" element={<DebtsPage />} />
                <Route path="finance/reports" element={<FinanceReportsPage />} />
                <Route path="finance/cashier" element={<CashierPage />} />
                <Route path="finance/budgets" element={<BudgetsPage />} />

                {/* Attendance */}
                <Route path="attendance" element={<DailyRollCallPage />} />
                <Route path="attendance/roll-call" element={<DailyRollCallPage />} />
                <Route path="attendance/history" element={<AbsenceHistoryPage />} />
                <Route path="attendance/justifications" element={<JustificationsPage />} />
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
                <Route path="settings" element={<Navigate to="school" replace />} />
                <Route path="settings/school" element={<SchoolInfoPage />} />
                <Route path="settings/academic-year" element={<AcademicYearPage />} />
                <Route path="settings/sections" element={<SectionsPage />} />
                <Route path="settings/subjects" element={<SubjectsPage />} />
                <Route path="settings/sync" element={<SyncPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}
