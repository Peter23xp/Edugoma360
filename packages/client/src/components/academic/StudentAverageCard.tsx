import { Award, TrendingUp, AlertCircle, Star } from 'lucide-react';
import type { StudentAverage } from '@edugoma360/shared/src/types/academic';

interface StudentAverageCardProps {
    student: StudentAverage;
    onClick?: () => void;
    termName?: string;
}

export default function StudentAverageCard({ student, onClick, termName }: StudentAverageCardProps) {
    const avg = student.generalAverage;

    const getAverageColor = (a: number | null) => {
        if (a === null) return { text: 'text-neutral-400', bg: 'bg-neutral-100', ring: 'ring-neutral-200' };
        if (a >= 16) return { text: 'text-yellow-700', bg: 'bg-yellow-50', ring: 'ring-yellow-300' };
        if (a >= 14) return { text: 'text-green-700', bg: 'bg-green-50', ring: 'ring-green-300' };
        if (a >= 10) return { text: 'text-blue-700', bg: 'bg-blue-50', ring: 'ring-blue-300' };
        if (a >= 8) return { text: 'text-orange-700', bg: 'bg-orange-50', ring: 'ring-orange-300' };
        return { text: 'text-red-700', bg: 'bg-red-50', ring: 'ring-red-300' };
    };

    const getStatusLabel = (a: number | null) => {
        if (a === null) return { label: 'Incomplet', color: 'text-neutral-500 bg-neutral-100' };
        if (a >= 16) return { label: 'Grande Distinction', color: 'text-yellow-700 bg-yellow-100' };
        if (a >= 14) return { label: 'Distinction', color: 'text-green-700 bg-green-100' };
        if (a >= 10) return { label: 'Admis', color: 'text-blue-700 bg-blue-100' };
        if (a >= 8) return { label: 'Ajourné', color: 'text-orange-700 bg-orange-100' };
        return { label: 'Refusé', color: 'text-red-700 bg-red-100' };
    };

    const colors = getAverageColor(avg);
    const status = getStatusLabel(avg);

    return (
        <button
            onClick={onClick}
            className="w-full bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md hover:border-primary/30 transition-all text-left group"
        >
            <div className="flex items-start gap-4">
                {/* Avatar / Rang */}
                <div className={`w-12 h-12 rounded-full ring-2 ${colors.ring} ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                    {student.photoUrl ? (
                        <img src={student.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <span className={`text-sm font-bold ${colors.text}`}>
                            #{student.rank}
                        </span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-neutral-900 text-sm truncate group-hover:text-primary transition-colors">
                            {student.studentName}
                        </p>
                        {avg !== null && avg >= 14 && (
                            <Star size={13} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                        )}
                    </div>
                    <p className="text-xs text-neutral-500">{student.studentMatricule}</p>
                    {termName && (
                        <p className="text-xs text-neutral-400 mt-0.5">{termName}</p>
                    )}
                </div>

                <div className="text-right flex-shrink-0">
                    <p className={`text-xl font-bold ${colors.text}`}>
                        {avg !== null ? avg.toFixed(1) : '—'}
                    </p>
                    <p className="text-xs text-neutral-500">/ 20</p>
                </div>
            </div>

            {/* Stats secondaires */}
            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                        <TrendingUp size={11} />
                        Rang {student.rank}
                    </span>
                    <span className="flex items-center gap-1">
                        <Award size={11} />
                        {student.totalPoints.toFixed(0)} pts
                    </span>
                    {!student.isComplete && (
                        <span className="flex items-center gap-1 text-orange-500">
                            <AlertCircle size={11} />
                            Incomplet
                        </span>
                    )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                    {status.label}
                </span>
            </div>
        </button>
    );
}


