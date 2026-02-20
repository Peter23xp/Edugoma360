import { Trophy, Medal, Award, AlertTriangle, XCircle } from 'lucide-react';

interface RankingRow {
    rank: number;
    studentName: string;
    generalAverage: number;
    totalPoints: number;
    decision: string;
    mention: string;
    badge: string;
}

interface PalmaresTableProps {
    rankings: RankingRow[];
}

export default function PalmaresTable({ rankings }: PalmaresTableProps) {
    const getRankBadge = (rank: number) => {
        if (rank === 1) {
            return (
                <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 
                                bg-gradient-to-r from-yellow-400 to-yellow-500 
                                text-white rounded-lg font-bold shadow-sm">
                    <Trophy size={16} />
                    {rank}
                </div>
            );
        }
        if (rank === 2) {
            return (
                <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 
                                bg-gradient-to-r from-gray-300 to-gray-400 
                                text-white rounded-lg font-bold shadow-sm">
                    <Medal size={16} />
                    {rank}
                </div>
            );
        }
        if (rank === 3) {
            return (
                <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 
                                bg-gradient-to-r from-orange-400 to-orange-500 
                                text-white rounded-lg font-bold shadow-sm">
                    <Award size={16} />
                    {rank}
                </div>
            );
        }
        return <span className="font-semibold text-neutral-700">{rank}</span>;
    };

    const getMentionBadge = (decision: string, mention: string) => {
        const badges: Record<string, { bg: string; text: string; border: string; icon?: any }> = {
            GREAT_DISTINCTION: {
                bg: 'bg-yellow-50',
                text: 'text-yellow-800',
                border: 'border-yellow-300',
                icon: Trophy,
            },
            DISTINCTION: {
                bg: 'bg-emerald-50',
                text: 'text-emerald-800',
                border: 'border-emerald-300',
                icon: Award,
            },
            ADMITTED: {
                bg: 'bg-green-50',
                text: 'text-green-800',
                border: 'border-green-300',
            },
            ADJOURNED: {
                bg: 'bg-orange-50',
                text: 'text-orange-800',
                border: 'border-orange-300',
                icon: AlertTriangle,
            },
            FAILED: {
                bg: 'bg-red-50',
                text: 'text-red-800',
                border: 'border-red-300',
                icon: XCircle,
            },
        };

        const badge = badges[decision] || badges.ADMITTED;
        const Icon = badge.icon;

        return (
            <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full 
                           text-sm font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
            >
                {Icon && <Icon size={14} />}
                {mention}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-primary text-white">
                        <tr>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase w-20">
                                Rang
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                Nom Complet
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase w-28">
                                Moyenne
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase w-28">
                                Points
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase w-48">
                                Mention
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                        {rankings.map((row) => (
                            <tr
                                key={row.rank}
                                className={`hover:bg-neutral-50 transition-colors ${
                                    row.rank <= 3 ? 'bg-green-50/30' : ''
                                }`}
                            >
                                <td className="px-4 py-3 text-center">
                                    {getRankBadge(row.rank)}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                                    {row.studentName}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="text-sm font-bold text-neutral-900">
                                        {row.generalAverage.toFixed(2)}
                                    </span>
                                    <span className="text-xs text-neutral-500">/20</span>
                                </td>
                                <td className="px-4 py-3 text-center text-sm font-semibold text-neutral-700">
                                    {row.totalPoints.toFixed(0)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {getMentionBadge(row.decision, row.mention)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

