import { Medal, Star, Trophy } from 'lucide-react';
import type { PalmaresEntry } from '@edugoma360/shared/types/academic';

interface PalmaresRankingListProps {
    entries: PalmaresEntry[];
    showAll?: boolean;
    onToggleShowAll?: () => void;
}

const PODIUM = [
    { rank: 1, icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-300', size: 'text-3xl' },
    { rank: 2, icon: Medal, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-300', size: 'text-2xl' },
    { rank: 3, icon: Medal, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300', size: 'text-2xl' },
];

function getMentionStyle(mention: string): string {
    switch (mention) {
        case 'Grande Distinction': return 'bg-yellow-100 text-yellow-800';
        case 'Distinction': return 'bg-green-100 text-green-800';
        case 'Satisfaction': return 'bg-blue-100 text-blue-800';
        default: return 'bg-neutral-100 text-neutral-600';
    }
}

function getAvgColor(avg: number): string {
    if (avg >= 16) return 'text-yellow-700';
    if (avg >= 14) return 'text-green-700';
    if (avg >= 10) return 'text-blue-700';
    return 'text-orange-600';
}

export default function PalmaresRankingList({ entries, showAll = false, onToggleShowAll }: PalmaresRankingListProps) {
    const top3 = entries.filter((e) => e.rank <= 3);
    const rest = entries.filter((e) => e.rank > 3);
    const displayed = showAll ? rest : rest.slice(0, 7);

    return (
        <div className="space-y-6">
            {/* Podium top 3 */}
            {top3.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    {[
                        top3.find((e) => e.rank === 1),
                        top3.find((e) => e.rank === 2),
                        top3.find((e) => e.rank === 3),
                    ].map((entry, i) => {
                        const p = PODIUM[i];
                        if (!entry) return <div key={i} className="bg-neutral-50 rounded-xl border border-dashed border-neutral-200 h-48" />;
                        const Icon = p.icon;
                        return (
                            <div key={entry.student.id}
                                className={`${p.bg} border-2 ${p.border} rounded-2xl p-5 text-center flex flex-col items-center gap-3 ${i === 0 ? 'shadow-lg' : ''}`}>
                                <Icon size={i === 0 ? 36 : 28} className={p.color} />
                                {entry.student.photoUrl ? (
                                    <img src={entry.student.photoUrl} alt=""
                                        className={`${i === 0 ? 'w-20 h-20' : 'w-16 h-16'} rounded-full object-cover border-2 ${p.border}`} />
                                ) : (
                                    <div className={`${i === 0 ? 'w-20 h-20' : 'w-16 h-16'} rounded-full ${p.bg} border-2 ${p.border} flex items-center justify-center`}>
                                        <span className={`font-black ${i === 0 ? 'text-2xl' : 'text-xl'} ${p.color}`}>
                                            {entry.student.nom.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-neutral-900 text-sm leading-tight">
                                        {entry.student.nom} {entry.student.postNom}
                                    </p>
                                    <p className="text-xs text-neutral-500">{entry.student.matricule}</p>
                                </div>
                                <p className={`${p.size} font-black ${getAvgColor(entry.generalAverage)}`}>
                                    {entry.generalAverage.toFixed(1)}
                                </p>
                                {entry.mention && (
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getMentionStyle(entry.mention)}`}>
                                        {entry.mention}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Liste rang 4+ */}
            {rest.length > 0 && (
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase w-16">Rang</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase">Élève</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase w-24">Moyenne</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase">Mention</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {displayed.map((entry) => (
                                <tr key={entry.student.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="text-sm font-bold text-neutral-500">#{entry.rank}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {entry.student.photoUrl ? (
                                                <img src={entry.student.photoUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center">
                                                    <span className="text-xs font-medium text-neutral-600">{entry.student.nom.charAt(0)}</span>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-neutral-900 flex items-center gap-1">
                                                    {entry.student.nom} {entry.student.postNom}
                                                    {entry.generalAverage >= 14 && <Star size={11} className="text-yellow-500 fill-yellow-500" />}
                                                </p>
                                                <p className="text-xs text-neutral-500">{entry.student.matricule}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`text-sm font-bold ${getAvgColor(entry.generalAverage)}`}>
                                            {entry.generalAverage.toFixed(1)}/20
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {entry.mention && (
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getMentionStyle(entry.mention)}`}>
                                                {entry.mention}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {rest.length > 7 && onToggleShowAll && (
                        <div className="p-3 text-center border-t border-neutral-100">
                            <button onClick={onToggleShowAll}
                                className="text-sm text-primary font-medium hover:underline">
                                {showAll ? 'Afficher moins' : `Afficher tous (${rest.length})`}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

