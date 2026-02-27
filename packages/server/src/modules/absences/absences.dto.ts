export interface CreateLeaveRequestDto {
    teacherId: string;
    type: 'MALADIE' | 'ANNUEL' | 'MATERNITE' | 'DECES' | 'CIRCONSTANCE' | 'PERSONNEL' | 'FORMATION';
    startDate: string;
    endDate: string;
    reason: string;
    certificatUrl?: string;
}

export interface UpdateLeaveStatusDto {
    status: 'APPROVED' | 'REJECTED' | 'CANCELLED';
    observations?: string;
}

export interface AbsenceFilters {
    teacherId?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
}
