import { Outlet } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
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
    const [topBarHeight, setTopBarHeight] = useState(56); // 56px = h-14 (header alone)
    const topBarRef = useRef<HTMLDivElement>(null);

    const user = useAuthStore((s) => s.user);
    const { setActiveSchool, setActiveAcademicYear, setActiveTerm } = useSchoolStore();

    useSync();

    // Measure the fixed top bar after each render so the scroll offset stays accurate
    // even when the offline banner appears/disappears.
    useEffect(() => {
        const el = topBarRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => setTopBarHeight(el.offsetHeight));
        ro.observe(el);
        setTopBarHeight(el.offsetHeight);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (!user) return;
        api.get('/settings/context').then((res) => {
            const { school, academicYear, term } = res.data.data ?? res.data;
            if (school) setActiveSchool(school.id, school.name);
            if (academicYear) setActiveAcademicYear(academicYear.id, academicYear.label);
            if (term) setActiveTerm(term.id, term.label);
        }).catch(() => { });
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-screen bg-neutral-100">
            {/* Sidebar — fixed, z-50 */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Mobile overlay — z-40, between header (z-30) and sidebar (z-50) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-[#0F1E12]/45 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Fixed top bar: offline banner + header.
                On desktop starts after the 256px sidebar (lg:left-64). */}
            <div
                ref={topBarRef}
                className="fixed top-0 left-0 right-0 lg:left-64 z-30 flex flex-col"
            >
                <OfflineBanner />
                <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
            </div>

            {/* Scrollable content — pushes down by the measured top bar height */}
            <div
                className="lg:ml-64 flex flex-col min-h-screen"
                style={{ paddingTop: topBarHeight }}
            >
                <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 w-full max-w-full overflow-x-hidden">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
}
