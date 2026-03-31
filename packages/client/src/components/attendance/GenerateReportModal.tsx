import { useState } from 'react';
import { X, FileBarChart, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

interface GenerateReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    startDate: string;
    endDate: string;
}

const REPORT_TYPES = [
    { id: 'SCHOOL', label: 'Rapport global école' },
    { id: 'CLASS', label: 'Rapport par classe' },
    { id: 'STUDENT', label: 'Rapport individuel élève' },
];

const SECTIONS = [
    { id: 'stats', label: 'Statistiques globales', defaultOn: true },
    { id: 'charts', label: 'Graphiques', defaultOn: true },
    { id: 'ranking', label: 'Classement des classes', defaultOn: true },
    { id: 'absenceList', label: 'Liste détaillée des absences', defaultOn: true },
    { id: 'atRisk', label: 'Élèves avec taux < 80%', defaultOn: true },
];

export default function GenerateReportModal({ isOpen, onClose, startDate, endDate }: GenerateReportModalProps) {
    const [reportType, setReportType] = useState('SCHOOL');
    const [format, setFormat] = useState<'PDF' | 'EXCEL'>('PDF');
    const [sections, setSections] = useState<string[]>(SECTIONS.filter(s => s.defaultOn).map(s => s.id));
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const toggleSection = (id: string) => {
        setSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            // In a real app, this would call POST /api/attendance/reports/generate
            await new Promise(resolve => setTimeout(resolve, 1800));
            toast.success('Rapport généré avec succès !', {
                style: { background: '#1B5E20', color: '#fff' },
                icon: '📊',
            });
            onClose();
        } catch {
            toast.error('Erreur lors de la génération du rapport');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-neutral-100 sticky top-0 bg-white z-10">
                    <h2 className="font-bold text-neutral-900 flex items-center gap-2">
                        <FileBarChart size={18} className="text-primary" />
                        Générer un rapport de présence
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-5 flex-1">
                    {/* Report Type */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Type de rapport *</label>
                        <div className="space-y-2">
                            {REPORT_TYPES.map((t) => (
                                <label key={t.id} className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="reportType"
                                        value={t.id}
                                        checked={reportType === t.id}
                                        onChange={() => setReportType(t.id)}
                                        className="text-primary h-4 w-4"
                                    />
                                    <span className="text-sm text-neutral-700">{t.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Période *</label>
                        <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2.5 text-sm text-neutral-700">
                            Du <span className="font-semibold text-primary">{new Date(startDate).toLocaleDateString('fr-FR')}</span>
                            {' '}au <span className="font-semibold text-primary">{new Date(endDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                    </div>

                    {/* Sections */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-neutral-700">Sections à inclure</label>
                            <div className="flex gap-2 text-xs">
                                <button onClick={() => setSections(SECTIONS.map(s => s.id))} className="text-primary hover:underline">Tout</button>
                                <span className="text-neutral-300">|</span>
                                <button onClick={() => setSections([])} className="text-neutral-500 hover:underline">Aucun</button>
                            </div>
                        </div>
                        <div className="space-y-2 bg-neutral-50 rounded-lg p-3 border border-neutral-200">
                            {SECTIONS.map((s) => (
                                <label key={s.id} className="flex items-center gap-2.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={sections.includes(s.id)}
                                        onChange={() => toggleSection(s.id)}
                                        className="h-4 w-4 rounded text-primary"
                                    />
                                    <span className="text-sm text-neutral-700">{s.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Format */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">Format</label>
                        <div className="flex gap-3">
                            {(['PDF', 'EXCEL'] as const).map((f) => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setFormat(f)}
                                    className={cn(
                                        "flex-1 py-2.5 border rounded-lg text-sm font-medium transition-all",
                                        format === f
                                            ? "bg-primary text-white border-primary"
                                            : "bg-white text-neutral-600 border-neutral-300 hover:border-primary/50"
                                    )}
                                >
                                    {f === 'PDF' ? '📄 PDF' : '📊 Excel'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-neutral-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 sticky bottom-0 bg-white">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50">
                        Annuler
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || sections.length === 0}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50",
                        )}
                    >
                        <Download size={15} />
                        {isGenerating ? 'Génération...' : 'Générer'}
                    </button>
                </div>
            </div>
        </div>
    );
}
