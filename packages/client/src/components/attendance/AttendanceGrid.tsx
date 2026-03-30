/**
 * AttendanceGrid — Full student table with scroll, keyboard nav and quick actions
 * Responsive: works on mobile (320px+), tablet & desktop
 */
import { CheckCheck, XCircle } from 'lucide-react';
import StudentAttendanceRow from './StudentAttendanceRow';
import type { AttendanceStatus } from '../../hooks/useAttendance';

interface StudentRow {
    studentId: string;
    student: {
        id: string;
        matricule: string;
        nom: string;
        postNom: string;
        prenom?: string;
        photoUrl?: string;
    };
    status?: AttendanceStatus;
    remark?: string;
    arrivalTime?: string;
    isJustified: boolean;
}

interface AttendanceGridProps {
    rows: StudentRow[];
    selectedIndex: number;
    isLocked: boolean;
    onStatusChange: (studentId: string, status: AttendanceStatus) => void;
    onAddRemark: (studentId: string) => void;
    onMarkAll: (status: AttendanceStatus) => void;
}

export default function AttendanceGrid({
    rows,
    selectedIndex,
    isLocked,
    onStatusChange,
    onAddRemark,
    onMarkAll,
}: AttendanceGridProps) {
    const noStatus = rows.filter((r) => !r.status).length;

    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
            {/* Quick actions row */}
            {!isLocked && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-50 border-b border-neutral-200">
                    <span className="text-xs font-medium text-neutral-500 mr-1 hidden sm:inline">Actions rapides :</span>
                    <button
                        type="button"
                        id="btn-mark-all-present"
                        onClick={() => onMarkAll('PRESENT')}
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-colors duration-150"
                    >
                        <CheckCheck size={13} />
                        <span className="hidden xs:inline">Tous </span>présents
                    </button>
                    <button
                        type="button"
                        id="btn-mark-all-absent"
                        onClick={() => onMarkAll('ABSENT')}
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-150"
                    >
                        <XCircle size={13} />
                        <span className="hidden xs:inline">Tous </span>absents
                    </button>
                    {noStatus > 0 && (
                        <span className="ml-auto text-xs text-orange-600 font-medium whitespace-nowrap">
                            ⚠ {noStatus} sans statut
                        </span>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto -mx-0">
                <table className="w-full min-w-[360px]">
                    <thead>
                        <tr className="table-header">
                            <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-center w-8 sm:w-10">#</th>
                            <th className="px-1.5 sm:px-2 py-2.5 sm:py-3 w-8 sm:w-10 hidden sm:table-cell">📷</th>
                            <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-left hidden md:table-cell">Matricule</th>
                            <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-left">Nom & Prénom</th>
                            <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-left">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <StudentAttendanceRow
                                key={row.studentId}
                                index={idx + 1}
                                student={row.student}
                                currentStatus={row.status}
                                hasRemark={!!row.remark}
                                isSelected={selectedIndex === idx}
                                isLocked={isLocked}
                                onStatusChange={onStatusChange}
                                onAddRemark={onAddRemark}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
