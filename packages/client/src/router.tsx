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
import DeliberationHistoryPage from './pages/grades/DeliberationHistoryPage';
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
import SMSPage from './pages/communication/SMSPage';
import ConvocationsPage from './pages/communication/ConvocationsPage';
import EmailPage from './pages/communication/EmailPage';
import AnnouncementsPage from './pages/communication/AnnouncementsPage';

// Parent Portal
import ParentHomePage from './pages/parent-portal/ParentHomePage';
import ParentGradesPage from './pages/parent-portal/ParentGradesPage';
import ParentAttendancePage from './pages/parent-portal/ParentAttendancePage';
import ParentPaymentsPage from './pages/parent-portal/ParentPaymentsPage';

// Reports
import ReportsPage from './pages/reports/ReportsPage';
import DirectionDashboardPage from './pages/reports/DirectionDashboardPage';
import SchoolStatsPage from './pages/reports/SchoolStatsPage';
import ReportGeneratorPage from './pages/reports/ReportGeneratorPage';
import ExportsPage from './pages/reports/ExportsPage';
import EduNcReportPage from './pages/reports/EduNcReportPage';
import ExamNationalPage from './pages/reports/ExamNationalPage';

// Settings
import ProfilePage from './pages/settings/ProfilePage';
import SchoolInfoPage from './pages/settings/SchoolInfoPage';
import AcademicYearPage from './pages/settings/AcademicYearPage';
import SubjectsPage from './pages/settings/SubjectsPage';
import SectionsPage from './pages/settings/SectionsPage';
import ClassesManagementPage from './pages/settings/ClassesManagementPage';
import ClassDetailPage from './pages/settings/ClassDetailPage';
import SyncPage from './pages/settings/SyncPage';
import UsersManagementPage from './pages/settings/UsersManagementPage';

// Finance
import ReceiptPage from './pages/finance/ReceiptPage';

// Discipline
import DisciplinePage from './pages/students/DisciplinePage';

// Inventory
import MaterialPage from './pages/inventory/MaterialPage';
import LibraryPage from './pages/inventory/LibraryPage';
import RoomsPage from './pages/inventory/RoomsPage';
import MaintenancePage from './pages/inventory/MaintenancePage';

// Access Denied
import AccessDeniedPage from './pages/AccessDeniedPage';

// Setup Wizard
import SetupWizardPage from './pages/setup/SetupWizardPage';

// Super Admin
import SuperAdminLayout    from './pages/SuperAdmin/SuperAdminLayout';
import MetricsDashboard    from './pages/SuperAdmin/MetricsDashboard';
import SchoolsTable        from './pages/SuperAdmin/SchoolsTable';
import PlansPage           from './pages/SuperAdmin/PlansPage';
import SubscriptionsPage   from './pages/SuperAdmin/SubscriptionsPage';
import SmsPage             from './pages/SuperAdmin/SmsPage';
import AdminsPage          from './pages/SuperAdmin/AdminsPage';
import NotificationsPage   from './pages/SuperAdmin/NotificationsPage';
import AuditPage           from './pages/SuperAdmin/AuditPage';
import SAExportsPage       from './pages/SuperAdmin/ExportsPage';

// Public Marketing
import LandingPage     from './pages/Landing/LandingPage';
import OnboardingPage  from './pages/Onboarding/OnboardingPage';

// Billing
import SubscriptionStatus from './pages/Billing/SubscriptionStatus';
import PaymentCallbackPage from './pages/Billing/PaymentCallbackPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    if (!isAuthenticated) {
        const redirect = window.location.pathname;
        const params = redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : '';
        return <Navigate to={`/login${params}`} replace />;
    }
    return <>{children}</>;
}

/** Platform super-admins must stay in the SaaS console, not in a tenant school app. */
function SchoolAppGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuthStore();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.isSuperAdmin) return <Navigate to="/superadmin" replace />;
    return <>{children}</>;
}

/** Blocks non-super-admins from /superadmin/* routes */
function SuperAdminGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuthStore();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!user?.isSuperAdmin) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}

function DefaultAuthenticatedRedirect() {
    const { isAuthenticated, user } = useAuthStore();
    if (!isAuthenticated) return <Navigate to="/" replace />;
    return <Navigate to={user?.isSuperAdmin ? '/superadmin' : '/dashboard'} replace />;
}

export default function AppRouter() {
    return (
        <Routes>
            {/* ── Public Marketing ── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<OnboardingPage />} />

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* ── Super Admin Space ── completely separate from school layout */}
            <Route
                path="/superadmin"
                element={
                    <SuperAdminGuard>
                        <SuperAdminLayout />
                    </SuperAdminGuard>
                }
            >
                <Route index element={<Navigate to="metrics" replace />} />
                <Route path="metrics"       element={<MetricsDashboard />} />
                <Route path="schools"       element={<SchoolsTable />} />
                <Route path="subscriptions" element={<SubscriptionsPage />} />
                <Route path="sms"           element={<SmsPage />} />
                <Route path="plans"         element={<PlansPage />} />
                <Route path="admins"        element={<AdminsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="audit"         element={<AuditPage />} />
                <Route path="exports"       element={<SAExportsPage />} />
            </Route>

            {/* Setup Wizard (Protected but outside AppLayout) */}
            <Route
                path="/setup"
                element={
                    <ProtectedRoute>
                        <SetupWizardPage />
                    </ProtectedRoute>
                }
            />

            {/* Protected app routes */}
            <Route
                element={
                    <ProtectedRoute>
                        <SchoolAppGuard>
                            <AppLayout />
                        </SchoolAppGuard>
                    </ProtectedRoute>
                }
            >
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
                <Route path="grades/deliberation/historique" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <DeliberationHistoryPage />
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
                <Route path="finance/receipt/:id" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ECONOME', 'PREFET', 'SECRETAIRE']}>
                        <ReceiptPage />
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
                        <SMSPage />
                    </RoleGuard>
                } />
                <Route path="emails" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'SECRETAIRE']}>
                        <EmailPage />
                    </RoleGuard>
                } />
                <Route path="convocations" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'SECRETAIRE']}>
                        <ConvocationsPage />
                    </RoleGuard>
                } />
                <Route path="announcements" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <AnnouncementsPage />
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
                <Route path="parent/grades" element={
                    <RoleGuard allowedRoles={['PARENT']}>
                        <ParentGradesPage />
                    </RoleGuard>
                } />
                <Route path="parent/attendance" element={
                    <RoleGuard allowedRoles={['PARENT']}>
                        <ParentAttendancePage />
                    </RoleGuard>
                } />
                <Route path="parent/payments" element={
                    <RoleGuard allowedRoles={['PARENT']}>
                        <ParentPaymentsPage />
                    </RoleGuard>
                } />

                {/* Reports */}
                <Route path="reports" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'ECONOME']}>
                        <ReportsPage />
                    </RoleGuard>
                } />
                <Route path="reports/dashboard" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <DirectionDashboardPage />
                    </RoleGuard>
                } />
                <Route path="reports/statistics" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <SchoolStatsPage />
                    </RoleGuard>
                } />
                <Route path="reports/generator" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <ReportGeneratorPage />
                    </RoleGuard>
                } />
                <Route path="reports/exports" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <ExportsPage />
                    </RoleGuard>
                } />
                <Route path="reports/edu-nc" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <EduNcReportPage />
                    </RoleGuard>
                } />
                <Route path="reports/exam-national" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <ExamNationalPage />
                    </RoleGuard>
                } />

                {/* Discipline */}
                <Route path="discipline" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <DisciplinePage />
                    </RoleGuard>
                } />

                {/* Inventory */}
                <Route path="inventory/material" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'SECRETAIRE']}>
                        <MaterialPage />
                    </RoleGuard>
                } />
                <Route path="inventory/library" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'SECRETAIRE']}>
                        <LibraryPage />
                    </RoleGuard>
                } />
                <Route path="inventory/rooms" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <RoomsPage />
                    </RoleGuard>
                } />
                <Route path="inventory/maintenance" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET']}>
                        <MaintenancePage />
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
                {/* Billing */}
                <Route path="billing" element={
                    <RoleGuard allowedRoles={['SUPER_ADMIN', 'PREFET', 'ECONOME']}>
                        <div className="space-y-6">
                            <div className="mb-4">
                                <h1 className="text-2xl font-bold text-neutral-900">Abonnement & Quotas</h1>
                                <p className="text-xs text-neutral-500 mt-1">Gérez votre formule SaaS et suivez la consommation en temps réel de vos élèves et SMS.</p>
                            </div>
                            <SubscriptionStatus />
                        </div>
                    </RoleGuard>
                } />
                <Route path="billing/callback" element={<PaymentCallbackPage />} />

                {/* Profile — accessible à tous les rôles */}
                <Route path="settings/profile" element={<ProfilePage />} />

                {/* Access denied (route directe) */}
                <Route path="access-denied" element={<AccessDeniedPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<DefaultAuthenticatedRedirect />} />
        </Routes>
    );
}
