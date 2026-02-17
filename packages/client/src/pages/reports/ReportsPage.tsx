import { FileBarChart, Download, Printer, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const reportCards = [
    { title: 'Bulletin scolaire', desc: 'Bulletin officiel EPSP-RDC par élève', icon: FileText, path: '/students', color: 'text-primary bg-success-bg' },
    { title: 'Palmarès', desc: 'Classement de la classe par trimestre', icon: FileBarChart, path: '/grades/averages', color: 'text-info bg-info-bg' },
    { title: 'Relevé des paiements', desc: 'Situation financière par élève/classe', icon: Download, path: '/finance', color: 'text-secondary bg-warning-bg' },
    { title: 'Rapport de présences', desc: 'Taux de présence par classe/période', icon: Printer, path: '/attendance/report', color: 'text-primary bg-success-bg' },
];

export default function ReportsPage() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2"><FileBarChart size={22} /> Rapports</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reportCards.map((card) => (
                    <button
                        key={card.title}
                        onClick={() => navigate(card.path)}
                        className="bg-white rounded-xl border border-neutral-300/50 p-5 text-left hover:shadow-md transition-shadow flex items-start gap-4"
                    >
                        <div className={`p-3 rounded-xl ${card.color}`}>
                            <card.icon size={22} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-neutral-900">{card.title}</h3>
                            <p className="text-sm text-neutral-500 mt-0.5">{card.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
