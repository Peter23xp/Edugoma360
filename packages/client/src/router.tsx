import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';

// Layout
import AppLayout from './components/layout/AppLayout';

// Guards
import RoleGuard from './components/guards/RoleGuard';

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
import ClassesManagementPage from './pages/settings/ClassesManagementPage';
import ClassDetailPage from './pages/settings/ClassDetailPage';
import SyncPage from './pages/settings/SyncPage';
import UsersManagementPage from './pages/settings/UsersManagementPage';

// Access Denied
import AccessDeniedPage from './pages/AccessDeniedPage';

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

                {/* Students — Tous les rôles sauf PARENT (a son portail dédié) */}
                <Route path="students" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'ECONOME', 'SECRETAIRE', 'ENSEIGNANT']}>
                        <StudentsListPage />
                    </RoleGuard>
                } />
                <Route path="students/new" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'SECRETAIRE']}>
                        <StudentFormPage />
                    </RoleGuard>
                } />
                <Route path="students/import" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'SECRETAIRE']}>
                        <StudentsImportPage />
                    </RoleGuard>
                } />
                <Route path="students/:id" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'ECONOME', 'SECRETAIRE', 'ENSEIGNANT']}>
                        <StudentDetailPage />
                    </RoleGuard>
                } />
                <Route path="students/:id/edit" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'SECRETAIRE']}>
                        <StudentFormPage />
                    </RoleGuard>
                } />

                {/* Teachers — Admin, Préfet seulement */}
                <Route path="teachers" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <TeachersListPage />
                    </RoleGuard>
                } />
                <Route path="teachers/new" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <TeacherFormPage />
                    </RoleGuard>
                } />
                <Route path="teachers/:id" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <TeacherDetailPage />
                    </RoleGuard>
                } />
                <Route path="teachers/:id/edit" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <TeacherFormPage />
                    </RoleGuard>
                } />
                <Route path="teachers/assignments" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <AssignmentsPage />
                    </RoleGuard>
                } />
                <Route path="teachers/reports" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <TeacherReportsPage />
                    </RoleGuard>
                } />
                <Route path="teachers/absences" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <AbsencesPage />
                    </RoleGuard>
                } />

                {/* Academic */}
                <Route path="classes" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'ENSEIGNANT']}>
                        <ClassesPage />
                    </RoleGuard>
                } />
                <Route path="classes/:classId/grades" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'ENSEIGNANT']}>
                        <ClassGradesPage />
                    </RoleGuard>
                } />
                <Route path="timetable" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'ENSEIGNANT']}>
                        <TimetablePage />
                    </RoleGuard>
                } />

                {/* Grades */}
                <Route path="grades" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'ENSEIGNANT']}>
                        <GradeEntryPage />
                    </RoleGuard>
                } />
                <Route path="grades/averages" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'ENSEIGNANT']}>
                        <AveragesPage />
                    </RoleGuard>
                } />
                <Route path="grades/deliberation" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <DeliberationPage />
                    </RoleGuard>
                } />
                <Route path="deliberation/pv" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <PVPage />
                    </RoleGuard>
                } />
                <Route path="palmares" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <PalmaresPage />
                    </RoleGuard>
                } />
                <Route path="grades/bulletin/:studentId" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'ENSEIGNANT']}>
                        <BulletinPage />
                    </RoleGuard>
                } />
                <Route path="grades/bulletin" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'ENSEIGNANT']}>
                        <BulletinPage />
                    </RoleGuard>
                } />
                <Route path="bulletin/batch" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <BulletinPage />
                    </RoleGuard>
                } />
                <Route path="bulletin/:studentId/:termId" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'ENSEIGNANT']}>
                        <AcademicBulletinPage />
                    </RoleGuard>
                } />
                <Route path="bulletin/:studentId" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'ENSEIGNANT']}>
                        <AcademicBulletinPage />
                    </RoleGuard>
                } />

                {/* Finance — Admin, Économe, Préfet */}
                <Route path="finance" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ECONOME', 'PREFET']}>
                        <FinanceDashboard />
                    </RoleGuard>
                } />
                <Route path="finance/fees" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ECONOME']}>
                        <FeesConfigPage />
                    </RoleGuard>
                } />
                <Route path="finance/payments" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ECONOME', 'PREFET', 'SECRETAIRE']}>
                        <PaymentsHistoryPage />
                    </RoleGuard>
                } />
                <Route path="finance/payments/new" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ECONOME', 'SECRETAIRE']}>
                        <PaymentEntryPage />
                    </RoleGuard>
                } />
                <Route path="finance/debts" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ECONOME', 'PREFET']}>
                        <DebtsPage />
                    </RoleGuard>
                } />
                <Route path="finance/reports" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ECONOME', 'PREFET']}>
                        <FinanceReportsPage />
                    </RoleGuard>
                } />
                <Route path="finance/cashier" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ECONOME']}>
                        <CashierPage />
                    </RoleGuard>
                } />
                <Route path="finance/budgets" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ECONOME', 'PREFET']}>
                        <BudgetsPage />
                    </RoleGuard>
                } />

                {/* Attendance */}
                <Route path="attendance" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'SECRETAIRE', 'ENSEIGNANT']}>
                        <DailyRollCallPage />
                    </RoleGuard>
                } />
                <Route path="attendance/roll-call" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'SECRETAIRE', 'ENSEIGNANT']}>
                        <DailyRollCallPage />
                    </RoleGuard>
                } />
                <Route path="attendance/history" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'SECRETAIRE', 'ENSEIGNANT']}>
                        <AbsenceHistoryPage />
                    </RoleGuard>
                } />
                <Route path="attendance/justifications" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'SECRETAIRE']}>
                        <JustificationsPage />
                    </RoleGuard>
                } />
                <Route path="attendance/report" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <AttendanceReportPage />
                    </RoleGuard>
                } />

                {/* Communication */}
                <Route path="sms" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'SECRETAIRE']}>
                        <SendSMSPage />
                    </RoleGuard>
                } />
                <Route path="convocations" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'SECRETAIRE']}>
                        <ConvocationsPage />
                    </RoleGuard>
                } />

                {/* Parent Portal — PARENT seulement */}
                <Route path="parent" element={
                    <RoleGuard allowedRoles={['PARENT']}>
                        <ParentHomePage />
                    </RoleGuard>
                } />
                <Route path="parent/home" element={
                    <RoleGuard allowedRoles={['PARENT']}>
                        <ParentHomePage />
                    </RoleGuard>
                } />

                {/* Reports */}
                <Route path="reports" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'ECONOME']}>
                        <ReportsPage />
                    </RoleGuard>
                } />

                {/* Settings — Admin et Préfet seulement */}
                <Route path="settings" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <Navigate to="school" replace />
                    </RoleGuard>
                } />
                <Route path="settings/school" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <SchoolInfoPage />
                    </RoleGuard>
                } />
                <Route path="settings/academic-year" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <AcademicYearPage />
                    </RoleGuard>
                } />
                <Route path="settings/sections" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <SectionsPage />
                    </RoleGuard>
                } />
                <Route path="settings/classes" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <ClassesManagementPage />
                    </RoleGuard>
                } />
                <Route path="settings/classes/:classId" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <ClassDetailPage />
                    </RoleGuard>
                } />
                <Route path="settings/subjects" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <SubjectsPage />
                    </RoleGuard>
                } />
                <Route path="settings/sync" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN']}>
                        <SyncPage />
                    </RoleGuard>
                } />
                <Route path="settings/users" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN']}>
                        <UsersManagementPage />
                    </RoleGuard>
                } />

                {/* Access denied (route directe) */}
                <Route path="access-denied" element={<AccessDeniedPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}
