export default function Footer() {
    return (
        <footer className="bg-white border-t border-neutral-300/50 px-4 py-3 text-center no-print">
            <p className="text-xs text-neutral-500">
                © {new Date().getFullYear()} <span className="font-semibold text-primary">EduGoma 360</span> —
                Système de Gestion Scolaire — Goma, Nord-Kivu, RDC
            </p>
        </footer>
    );
}
