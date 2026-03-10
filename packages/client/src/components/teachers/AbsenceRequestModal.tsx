import { useState, useEffect } from 'react';
import { X, Calendar, Send } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import { parseISO, isWeekend, addDays } from 'date-fns';
import { useAuthStore, User } from '../../stores/auth.store';

function calculateDurationExcludingWeekends(startStr: string, endStr: string): number {
    if (!startStr || !endStr) return 0;
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    if (end < start) return 0;
    let count = 0;
    let current = start;
    while (current <= end) {
        if (!isWeekend(current)) count++;
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
            toast.error(error.response?.data?.message || error.message || "Erreur lors de l'envoi");
        }
    });

    if (!isOpen) return null;

    const inputClass = "w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm text-neutral-900 appearance-none";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-neutral-300/50">
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg shadow-md shadow-primary/20">
                            <Calendar size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-neutral-900">Nouvelle demande</h2>
                            <p className="text-xs text-neutral-500">Congés & absences</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 text-neutral-400 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="px-6 py-5 space-y-4">
                    {!isTeacher ? (
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Enseignant</label>
                            <select
                                required
                                value={formData.teacherId}
                                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                                className={inputClass}
                            >
                                <option value="">Sélectionner un enseignant</option>
                                {teachers.map((t: any) => (
                                    <option key={t.id} value={t.id}>{t.matricule} - {t.nom} {t.prenom}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-primary font-bold shadow-sm border border-neutral-100 text-sm">
                                {user?.nom?.[0]}{user?.postNom?.[0]}
                            </div>
                            <div>
                                <p className="text-xs text-neutral-500">Compte demandeur</p>
                                <p className="text-sm font-semibold text-neutral-800">{user?.nom} {user?.postNom} {user?.prenom}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Type de congé</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className={inputClass}
                        >
                            <option value="ANNUEL">Annuel (Droit: 20j/an)</option>
                            <option value="MALADIE">Maladie (Besoin de certificat)</option>
                            <option value="PERSONNEL">Affaire personnelle (Déduit du solde)</option>
                            <option value="MATERNITE">Maternité / Paternité</option>
                            <option value="DECES">Décès / Deuil</option>
                            <option value="FORMATION">Formation / Stage</option>
                            <option value="CIRCONSTANCE">Circonstance particulière</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Date de début</label>
                            <input
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Date de fin</label>
                            <input
                                type="date"
                                required
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {duration > 0 && (
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                            <span className="text-xs text-blue-600 font-medium">Durée estimée</span>
                            <span className="text-sm font-bold text-blue-800">
                                {duration} jours <span className="text-xs font-normal text-blue-500">(hors weekends)</span>
                            </span>
                        </div>
                    )}

                    {formData.type === 'MALADIE' && (
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Certificat médical (URL)</label>
                            <input
                                type="text"
                                value={formData.certificatUrl}
                                onChange={(e) => setFormData({ ...formData, certificatUrl: e.target.value })}
                                placeholder="Lien vers le certificat (optionnel mais recommandé)"
                                className={inputClass}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Motif / Justification</label>
                        <textarea
                            required
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className="w-full h-24 px-3 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl 
                                       focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 
                                       transition-all resize-none"
                            placeholder="Détaillez la raison de l'absence..."
                        />
                    </div>

                    {/* Footer */}
                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-neutral-300 text-neutral-700 rounded-xl 
                                       text-sm font-medium hover:bg-neutral-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white 
                                       rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-primary/25 
                                       transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md 
                                       flex items-center justify-center gap-2"
                        >
                            {mutation.isPending ? 'Envoi...' : <><Send size={14} /> Soumettre</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
