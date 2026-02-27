import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { FileText, Table, Check, X } from 'lucide-react';

interface ExportReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (format: 'pdf' | 'excel', options: any) => void;
}

export default function ExportReportModal({ isOpen, onClose, onExport }: ExportReportModalProps) {
    const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
    const [options, setOptions] = useState({
        overview: true,
        ranking: true,
        performanceChart: true,
        workload: true,
        attendance: true
    });

    const toggleOption = (key: keyof typeof options) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border-2 border-slate-50 animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20"><FileText size={24} /></div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none mb-1">Exporter Rapport</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enseignants & Statistiques</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white hover:bg-slate-100 text-slate-300 rounded-2xl transition-all border border-slate-50"><X size={20} /></button>
                </div>

                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Format Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setFormat('pdf')}
                            className={`flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all ${format === 'pdf' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 hover:border-slate-100'}`}
                        >
                            <div className={`p-3 rounded-2xl ${format === 'pdf' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>
                                <FileText size={20} />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-tight">Format PDF</span>
                        </button>
                        <button
                            onClick={() => setFormat('excel')}
                            className={`flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all ${format === 'excel' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 hover:border-slate-100'}`}
                        >
                            <div className={`p-3 rounded-2xl ${format === 'excel' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>
                                <Table size={20} />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-tight">Format Excel</span>
                        </button>
                    </div>

                    {/* Content Options */}
                    <div className="space-y-3">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Contenu à inclure</h4>
                        <div className="grid grid-cols-1 gap-2">
                            {Object.entries({
                                overview: "Vue d'ensemble",
                                ranking: "Classement enseignants",
                                performanceChart: "Graphique d'évolution",
                                workload: "Charge de travail",
                                attendance: "Heatmap d'assiduité"
                            }).map(([key, label]) => (
                                <button
                                    key={key}
                                    onClick={() => toggleOption(key as any)}
                                    className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-50 hover:bg-slate-50/50 transition-all text-left"
                                >
                                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{label}</span>
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${options[key as keyof typeof options] ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-100'}`}>
                                        <Check size={14} strokeWidth={4} className={options[key as keyof typeof options] ? 'opacity-100' : 'opacity-0'} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-3">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Observations du Préfet (Optionnel)</h4>
                        <textarea
                            className="w-full h-24 p-5 text-sm bg-slate-50 border-2 border-slate-50 rounded-[32px] focus:bg-white focus:border-primary focus:outline-none transition-all resize-none font-medium"
                            placeholder="Saisissez vos commentaires..."
                        />
                    </div>
                </div>

                <div className="p-8 border-t-2 border-slate-50 flex gap-4">
                    <Button variant="ghost" onClick={onClose} className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest">
                        Annuler
                    </Button>
                    <Button
                        onClick={() => onExport(format, options)}
                        className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/20"
                    >
                        Générer le rapport
                    </Button>
                </div>
            </div>
        </div>
    );
}
