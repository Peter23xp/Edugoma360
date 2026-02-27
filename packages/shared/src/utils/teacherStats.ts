/**
 * Shared Teacher Statistics Utilities
 */

export type TeacherPerformanceBadge = 'EXCELLENT' | 'BON' | 'MOYEN' | 'FAIBLE';
export type WorkloadStatus = 'SURCHARGE' | 'OPTIMAL' | 'SOUS_UTILISE';

/**
 * Calculate teacher performance (average of class averages)
 */
export function calculateTeacherPerformance(classAverages: number[]): number {
    if (classAverages.length === 0) return 0;
    const sum = classAverages.reduce((acc, val) => acc + val, 0);
    return Number((sum / classAverages.length).toFixed(1));
}

/**
 * Calculate success rate (% of students >= 10)
 */
export function calculateSuccessRate(students: Array<{ average: number }>): number {
    if (students.length === 0) return 0;
    const passed = students.filter(s => s.average >= 10).length;
    return Math.round((passed / students.length) * 100);
}

/**
 * Calculate total workload hours
 */
export function calculateWorkload(assignments: Array<{ volumeHoraire: number }>): number {
    return assignments.reduce((sum, a) => sum + (a.volumeHoraire || 0), 0);
}

/**
 * Calculate attendance rate
 */
export function calculateAttendanceRate(attendances: Array<{ status: string }>): number {
    if (attendances.length === 0) return 0;
    const presentCount = attendances.filter(a =>
        a.status === 'PRESENT' || a.status === 'RETARD'
    ).length;
    return Math.round((presentCount / attendances.length) * 100);
}

/**
 * Determine performance badge based on average grade and success rate
 */
export function determinePerformanceBadge(
    averageGrade: number,
    successRate: number
): TeacherPerformanceBadge {
    if (averageGrade >= 14 && successRate >= 85) return 'EXCELLENT';
    if (averageGrade >= 12 && successRate >= 70) return 'BON';
    if (averageGrade >= 10 && successRate >= 60) return 'MOYEN';
    return 'FAIBLE';
}

/**
 * Determine workload status based on weekly hours
 */
export function determineWorkloadStatus(hours: number): WorkloadStatus {
    if (hours > 20) return 'SURCHARGE';
    if (hours >= 12) return 'OPTIMAL';
    return 'SOUS_UTILISE';
}
