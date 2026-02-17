import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import OfflineBanner from './OfflineBanner';
import { useSync } from '../../hooks/useSync';
import { useAuthStore } from '../../stores/auth.store';
import { useSchoolStore } from '../../stores/school.store';
import api from '../../lib/api';

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = useAuthStore((s) => s.user);
    const { setActiveSchool, setActiveAcademicYear, setActiveTerm } = useSchoolStore();

    // Initialize sync
    useSync();

    // Load school context
    useEffect(() => {
        if (!user) return;
        api.get('/settings/context').then((res) => {
            const { school, academicYear, term } = res.data;
            if (school) setActiveSchool(school.id, school.name);
            if (academicYear) setActiveAcademicYear(academicYear.id, academicYear.label);
            if (term) setActiveTerm(term.id, term.label);
        }).catch(() => { });
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-screen bg-neutral-100 flex">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
                <OfflineBanner />
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>

                <Footer />
            </div>
        </div>
    );
}
