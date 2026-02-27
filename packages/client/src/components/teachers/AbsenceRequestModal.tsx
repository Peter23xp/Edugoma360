import { useState, useEffect } from 'react';
import { X, Calendar, Send } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import { parseISO, isWeekend, addDays } from 'date-fns';
import { useAuthStore, User } from '../../stores/auth.store';

/**
 * Calcule la durée en jours excluant les weekends (Frontend version)
 */
function calculateDurationExcludingWeekends(startStr: string, endStr: string): number {
    if (!startStr || !endStr) return 0;
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    if (end < start) return 0;

    let count = 0;
    let current = start;
    while (current <= end) {
        if (!isWeekend(current)) {
            count++;
        }
        current = addDays(current, 1);
    }
    return count;
}

interface AbsenceRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AbsenceRequestModal({ isOpen, onClose }: AbsenceRequestModalProps) {
    const queryClient = useQueryClient();
    const user = useAuthStore(s => s.user) as User | null;
    const isTeacher = user?.role === 'ENSEIGNANT';

    const [formData, setFormData] = useState({
        teacherId: '',
        type: 'ANNUEL',
        startDate: '',
        endDate: '',
        reason: '',
        certificatUrl: ''
    });

    const { data: teachers = [] } = useQuery({
        queryKey: ['teachers-simple'],
        queryFn: async () => {
            const res = await api.get('/teachers?limit=100');
            return res.data.data;
        },
        enabled: !isTeacher
    });

    const [myProfile, setMyProfile] = useState<any>(null);

    // Automatically set teacherId if user is a teacher
    useEffect(() => {
        if (isTeacher) {
            api.get('/teachers').then(res => {
                const profile = res.data.data.find((t: any) => t.userId === user?.id);
                if (profile) {
                    setMyProfile(profile);
                    setFormData(prev => ({ ...prev, teacherId: profile.id }));
                }
            });
        }
    }, [isTeacher, user?.id]);

    const duration = calculateDurationExcludingWeekends(formData.startDate, formData.endDate);

    const mutation = useMutation({
        mutationFn: (data: any) => {
            // Gender validation for MATERNITE
            const selectedTeacher = isTeacher ? myProfile : teachers.find((t: any) => t.id === data.teacherId);
            if (data.type === 'MATERNITE' && selectedTeacher?.sexe === 'M') {
                throw new Error('Le congé de maternité est réservé aux enseignantes.');
            }
            return api.post('/absences', data);
        },
        onSuccess: () => {
            toast.success('Demande envoyée avec succès');
            queryClient.invalidateQueries({ queryKey: ['teacher-absences'] });
            queryClient.invalidateQueries({ queryKey: ['teacher-absences-stats'] });
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || error.message || 'Erreur lors de l\'envoi');
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border-2 border-slate-50 animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20"><Calendar size={24} /></div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none mb-1">Nouvelle Demande</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Congés & Absences</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white hover:bg-slate-100 text-slate-300 rounded-2xl transition-all border border-slate-50"><X size={20} /></button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                        {!isTeacher ? (
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Enseignant</label>
                                <select
                                    required
                                    value={formData.teacherId}
                                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-900 appearance-none"
                                >
                                    <option value="">Sélectionner un enseignant</option>
                                    {teachers.map((t: any) => (
                                        <option key={t.id} value={t.id}>{t.matricule} - {t.nom} {t.prenom}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary font-black shadow-sm">
                                    {user?.nom?.[0]}{user?.postNom?.[0]}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compte demandeur</p>
                                    <p className="text-sm font-black text-slate-800 uppercase">{user?.nom} {user?.postNom} {user?.prenom}</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Type de congé</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-900 appearance-none"
                            >
                                <option value="ANNUEL">Annuel (Droit: 20j/an)</option>
                                <option value="MALADIE">Maladie (Besoin de certificat)</option>
                                <option value="PERSONNEL">Affaire Personnelle (Déduit du solde)</option>
                                <option value="MATERNITE">Maternité / Paternité</option>
                                <option value="DECES">Décès / Deuil</option>
                                <option value="FORMATION">Formation / Stage</option>
                                <option value="CIRCONSTANCE">Circonstance particulière</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Date de début</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-900"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Date de fin</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-900"
                                />
                            </div>
                        </div>

                        {duration > 0 && (
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Durée estimée</span>
                                <span className="text-sm font-black text-blue-700">{duration} jours <span className="text-[10px] opacity-60">(Hors weekends)</span></span>
                            </div>
                        )}

                        {formData.type === 'MALADIE' && (
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Certificat médical (URL)</label>
                                <input
                                    type="text"
                                    value={formData.certificatUrl}
                                    onChange={(e) => setFormData({ ...formData, certificatUrl: e.target.value })}
                                    placeholder="Lien vers le certificat (optionnel mais recommandé)"
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-all font-bold text-slate-900"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Motif / Justification</label>
                            <textarea
                                required
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full h-24 p-5 text-sm bg-slate-50 border-2 border-slate-50 rounded-[32px] focus:bg-white focus:border-primary focus:outline-none transition-all resize-none font-medium"
                                placeholder="Détaillez la raison de l'absence..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
                        >
                            {mutation.isPending ? 'Envoi...' : <><Send size={14} /> Soumettre</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
