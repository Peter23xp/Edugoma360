export interface TeacherPerformanceStats {
    classId: string;
    className: string;
    effectif: number;
    moyT1: number;
    moyT2: number;
    moyT3: number;
    successRate: number;
}

export interface TeacherGlobalMetrics {
    averageClasses: number;
    successRate: number;
    attendanceRate: number;
}

export function calculateTeacherMetrics(stats: TeacherPerformanceStats[]): TeacherGlobalMetrics {
    if (stats.length === 0) {
        return { averageClasses: 0, successRate: 0, attendanceRate: 100 };
    }

    const totals = stats.reduce(
        (acc, curr) => {
            acc.sumMoy += (curr.moyT1 + curr.moyT2 + curr.moyT3) / 3;
            acc.sumSuccess += curr.successRate;
            return acc;
        },
        { sumMoy: 0, sumSuccess: 0 }
    );

    return {
        averageClasses: parseFloat((totals.sumMoy / stats.length).toFixed(1)),
        successRate: Math.round(totals.sumSuccess / stats.length),
        attendanceRate: 98, // Mocked for now
    };
}
