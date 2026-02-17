import { useQuery } from '@tanstack/react-query';
import { User, GraduationCap, Wallet, CalendarCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import { formatFC } from '@edugoma360/shared';

export default function ParentHomePage() {
    const { user } = useAuth();

    const { data: children } = useQuery({
        queryKey: ['parent-children'],
        queryFn: async () => (await api.get('/parent/children')).data,
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-neutral-900">Portail Parent</h1>
                <p className="text-sm text-neutral-500">Bienvenue, {user?.prenom || user?.nom}</p>
            </div>

            {children?.map((child: Record<string, unknown>) => (
                <div key={String(child.id)} className="bg-white rounded-xl border border-neutral-300/50 p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                            {String(child.nom).charAt(0)}{String(child.postNom).charAt(0)}
                        </div>
                        <div>
                            <h2 className="font-semibold">{String(child.nom).toUpperCase()} {String(child.postNom).toUpperCase()} {String(child.prenom ?? '')}</h2>
                            <p className="text-xs text-neutral-500">{String(child.className)} — {String(child.matricule)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="card-stat">
                            <p className="text-xs text-neutral-500 flex items-center gap-1"><GraduationCap size={12} /> Dernière moyenne</p>
                            <p className="text-lg font-bold text-primary mt-1">{String(child.lastAverage ?? '—')}/20</p>
                        </div>
                        <div className="card-stat">
                            <p className="text-xs text-neutral-500 flex items-center gap-1"><CalendarCheck size={12} /> Présences</p>
                            <p className="text-lg font-bold text-success mt-1">{String(child.attendanceRate ?? '—')}%</p>
                        </div>
                        <div className="card-stat">
                            <p className="text-xs text-neutral-500 flex items-center gap-1"><Wallet size={12} /> Solde dû</p>
                            <p className={`text-lg font-bold mt-1 ${Number(child.balance) > 0 ? 'text-danger' : 'text-success'}`}>
                                {child.balance != null ? formatFC(Number(child.balance)) : '—'}
                            </p>
                        </div>
                    </div>
                </div>
            ))}

            {(!children || children.length === 0) && (
                <div className="text-center py-12 text-neutral-500 text-sm">
                    <User size={32} className="mx-auto mb-3 text-neutral-300" />
                    Aucun enfant associé à ce compte
                </div>
            )}
        </div>
    );
}
