import { useState } from 'react';
import { User, Trophy, AlertTriangle, CheckCircle, Minus } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { TeacherPerformanceBadge, WorkloadStatus } from '@edugoma360/shared';

interface RankingTeacher {
    id: string;
    rank: number;
    name: string;
    photoUrl?: string;
    averageGrade: number;
    successRate: number;
    workload: number;
    attendanceRate: number;
    classesCount: number;
    badge: TeacherPerformanceBadge;
    workloadStatus: WorkloadStatus;
    evolution: number;
}

interface TeacherRankingTableProps {
    data: RankingTeacher[];
    isLoading: boolean;
    onTeacherClick: (id: string) => void;
}

export default function TeacherRankingTable({ data, isLoading, onTeacherClick }: TeacherRankingTableProps) {
    const [activeTab, setActiveTab] = useState<'performance' | 'workload' | 'attendance'>('performance');

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'performance', label: 'Performances' },
        { id: 'workload', label: 'Charge travail' },
        { id: 'attendance', label: 'Assiduité' }
    ];

    const getPerformanceBadge = (badge: TeacherPerformanceBadge) => {
        switch (badge) {
            case 'EXCELLENT':
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold"><Trophy size={10} /> EXCELLENT</span>;
            case 'BON':
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold"><CheckCircle size={10} /> BON</span>;
            case 'MOYEN':
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold"><Minus size={10} /> MOYEN</span>;
            case 'FAIBLE':
                return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold"><AlertTriangle size={10} /> FAIBLE</span>;
        }
    };

    const getWorkloadStatusBadge = (status: WorkloadStatus) => {
        switch (status) {
            case 'SURCHARGE':
                return <span className="text-rose-600 font-semibold">⚠️ Surchargé</span>;
            case 'OPTIMAL':
                return <span className="text-emerald-600 font-semibold">✅ Optimal</span>;
            case 'SOUS_UTILISE':
                return <span className="text-amber-600 font-semibold">🟡 Sous-ut.</span>;
        }
    };

    const getAttendanceTrend = (rate: number) => {
        if (rate >= 95) return 'text-emerald-500';
        if (rate >= 85) return 'text-blue-500';
        if (rate >= 75) return 'text-amber-500';
        return 'text-rose-500';
    };

    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
            {/* Tabs */}
            <div className="flex border-b border-neutral-200 p-1 bg-neutral-50/50">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex-1 py-2 px-4 text-xs font-semibold rounded-lg transition-all",
                            activeTab === tab.id
                                ? "bg-white text-primary shadow-sm"
                                : "text-neutral-500 hover:text-neutral-700 hover:bg-white/50"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-neutral-50/50 border-b border-neutral-200">
                            <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider w-12 text-center">Rang</th>
                            <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Enseignant</th>
                            {activeTab === 'performance' && (
                                <>
                                    <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-center">Classes</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-center">Moy</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-center">Taux</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-center">Évol</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Badge</th>
                                </>
                            )}
                            {activeTab === 'workload' && (
                                <>
                                    <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-center">Heures</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-center">Classes</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-center">Élèves</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Statut</th>
                                </>
                            )}
                            {activeTab === 'attendance' && (
                                <>
                                    <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-center">Taux</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-center">Évol</th>
                                    <th className="px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Statut</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {data.map((teacher) => (
                            <tr
                                key={teacher.id}
                                onClick={() => onTeacherClick(teacher.id)}
                                className="group hover:bg-neutral-50/80 cursor-pointer transition-colors"
                            >
                                <td className="px-4 py-4 text-center font-bold text-neutral-400 group-hover:text-primary transition-colors">
                                    {teacher.rank}
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200 shrink-0">
                                            {teacher.photoUrl ? (
                                                <img src={teacher.photoUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="text-neutral-400" size={18} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-neutral-900 leading-none mb-1 group-hover:text-primary transition-colors">
                                                {teacher.name}
                                            </p>
                                            <p className="text-[11px] text-neutral-400 font-medium">Enseignant</p>
                                        </div>
                                    </div>
                                </td>

                                {activeTab === 'performance' && (
                                    <>
                                        <td className="px-4 py-4 text-center text-sm font-semibold text-neutral-600">
                                            {teacher.classesCount}
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm font-bold text-neutral-900">
                                            {teacher.averageGrade}
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm font-semibold text-neutral-600">
                                            {teacher.successRate}%
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={cn(
                                                "text-xs font-bold",
                                                teacher.evolution > 0 ? "text-emerald-600" : "text-rose-600"
                                            )}>
                                                {teacher.evolution > 0 ? `+${teacher.evolution}` : teacher.evolution}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {getPerformanceBadge(teacher.badge)}
                                        </td>
                                    </>
                                )}

                                {activeTab === 'workload' && (
                                    <>
                                        <td className="px-4 py-4 text-center text-sm font-bold text-neutral-900">
                                            {teacher.workload}h
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm font-semibold text-neutral-600">
                                            {teacher.classesCount}
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm font-semibold text-neutral-600">
                                            -
                                        </td>
                                        <td className="px-4 py-4 text-xs">
                                            {getWorkloadStatusBadge(teacher.workloadStatus)}
                                        </td>
                                    </>
                                )}

                                {activeTab === 'attendance' && (
                                    <>
                                        <td className="px-4 py-4 text-center">
                                            <span className={cn("text-sm font-bold", getAttendanceTrend(teacher.attendanceRate))}>
                                                {teacher.attendanceRate}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-emerald-500 text-xs font-bold">🟢</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                                teacher.attendanceRate >= 95 ? "bg-emerald-100 text-emerald-700" :
                                                    teacher.attendanceRate >= 85 ? "bg-blue-100 text-blue-700" :
                                                        "bg-rose-100 text-rose-700"
                                            )}>
                                                {teacher.attendanceRate >= 95 ? 'Excellent' : teacher.attendanceRate >= 85 ? 'Régulier' : 'Inconstant'}
                                            </span>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
