import { useState } from 'react';
import { X, FileDown, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import type { BulletinGenerationJob } from '@edugoma360/shared/types/academic';

interface ClassOption { id: string; name: string }
interface TermOption { id: string; name: string }

interface BulletinBatchGeneratorProps {
    classes: ClassOption[];
    terms: TermOption[];
    onClose?: () => void;
}

export default function BulletinBatchGenerator({ classes, terms, onClose }: BulletinBatchGeneratorProps) {
    const [classId, setClassId] = useState('');
    const [termId, setTermId] = useState('');
    const [jobId, setJobId] = useState<string | null>(null);

    const generateMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/bulletins/batch', { classId, termId });
            return res.data?.jobId as string;
        },
        onSuccess: (id) => setJobId(id),
    });

    const jobQuery = useQuery<BulletinGenerationJob>({
        queryKey: ['bulletin-job', jobId],
        queryFn: async () => {
            const res = await api.get(`/bulletins/batch/${jobId}`);
            return res.data?.data ?? res.data;
        },
        enabled: !!jobId,
        refetchInterval: (query) => {
            const d = query.state.data;
            if (!d) return 2000;
            return d.status === 'DONE' || d.status === 'ERROR' ? false : 2000;
        },
    });

    const job = jobQuery.data;
    const isRunning = job?.status === 'PENDING' || job?.status === 'PROCESSING';
    const isDone = job?.status === 'DONE';
    const hasError = job?.status === 'ERROR';
    const progressPct = job && job.total > 0 ? Math.round((job.processed / job.total) * 100) : 0;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <div>
                        <h2 className="text-lg font-bold text-neutral-900">Génération en masse</h2>
                        <p className="text-sm text-neutral-500">Bulletins PDF pour toute la classe</p>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100">
                            <X size={18} className="text-neutral-500" />
                        </button>
                    )}
                </div>

                <div className="p-6 space-y-5">
                    {!jobId && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-neutral-700">Classe</label>
                                <select value={classId} onChange={(e) => setClassId(e.target.value)}
                                    className="w-full h-10 px-3 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                                    <option value="">Sélectionner une classe…</option>
                                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-neutral-700">Trimestre</label>
                                <select value={termId} onChange={(e) => setTermId(e.target.value)}
                                    className="w-full h-10 px-3 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                                    <option value="">Sélectionner un trimestre…</option>
                                    {terms.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {jobId && (
                        <div className="space-y-4">
                            {isRunning && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-neutral-500 flex items-center gap-2">
                                            <Loader2 size={14} className="animate-spin text-primary" />
                                            Génération en cours…
                                        </span>
                                        <span className="font-semibold">{job?.processed}/{job?.total}</span>
                                    </div>
                                    <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all duration-500"
                                            style={{ width: `${progressPct}%` }} />
                                    </div>
                                    <p className="text-xs text-neutral-400">{progressPct}%</p>
                                </div>
                            )}
                            {isDone && (
                                <div className="text-center space-y-4 py-4">
                                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                                        <CheckCircle size={28} className="text-green-600" />
                                    </div>
                                    <p className="font-semibold text-neutral-900">{job?.processed} bulletin(s) généré(s)</p>
                                    {job?.zipUrl && (
                                        <a href={job.zipUrl} download
                                            className="inline-flex items-center gap-2 h-11 px-6 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90">
                                            <FileDown size={16} /> Télécharger ZIP
                                        </a>
                                    )}
                                </div>
                            )}
                            {hasError && (
                                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-xl p-4">
                                    <AlertCircle size={16} />
                                    Génération échouée — vérifiez les logs serveur.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!jobId && (
                    <div className="flex gap-3 p-6 border-t border-neutral-200">
                        <button onClick={onClose} className="flex-1 h-10 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200">
                            Annuler
                        </button>
                        <button onClick={() => generateMutation.mutate()}
                            disabled={!classId || !termId || generateMutation.isPending}
                            className="flex-1 h-10 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50">
                            {generateMutation.isPending ? <><Loader2 size={15} className="animate-spin" /> Lancement…</> : <><FileDown size={15} /> Générer</>}
                        </button>
                    </div>
                )}
                {(isDone || hasError) && onClose && (
                    <div className="px-6 pb-6">
                        <button onClick={onClose} className="w-full h-10 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200">Fermer</button>
                    </div>
                )}
            </div>
        </div>
    );
}

