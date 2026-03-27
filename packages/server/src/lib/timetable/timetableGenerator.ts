import prisma from '../prisma';

export interface GenerateTimetableConfig {
    schoolId: string;
    academicYearId: string;
    classId?: string; // If provided, generates for a single class. Otherwise all active classes.
    days: string[]; // ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI']
    periodsPerDay: number; // e.g. 6 (6 periods of 50 minutes)
}

/**
 * Basic constraint-based timetable generator.
 * This is a simplified greedy algorithm algorithm:
 * 1. For each class, for each subject assignment, we need to place X periods (based on volumeHoraire/coeff).
 * 2. We cannot schedule a teacher in two different classes at the same day & period.
 * 3. We cannot schedule a class with two different subjects at the same day & period.
 */
export async function generateTimetable(config: GenerateTimetableConfig) {
    const { schoolId, academicYearId, classId, days, periodsPerDay } = config;

    // 1. Fetch data
    const classes = await prisma.class.findMany({
        where: {
            schoolId,
            isActive: true,
            ...(classId ? { id: classId } : {}),
        },
        include: {
            section: {
                include: { subjects: true },
            },
        },
    });

    if (classes.length === 0) return { success: false, message: 'Aucune classe trouvée.' };

    const classIds = classes.map(c => c.id);

    // Get assignments for these classes
    const assignments = await prisma.teacherClassSubject.findMany({
        where: {
            academicYearId,
            classId: { in: classIds },
        },
        include: {
            subject: true,
        },
    });

    if (assignments.length === 0) return { success: false, message: 'Aucune attribution d\'enseignant trouvée.' };

    // 2. Clear existing timetable for these assignments
    const assignmentIds = assignments.map(a => a.id);
    await prisma.timetablePeriod.deleteMany({
        where: { teacherClassSubjectId: { in: assignmentIds } },
    });

    // 3. Setup scheduling state
    // Maps to track availability:
    // teacherAvailability: Map<teacherId, Set<day-period>>
    // classAvailability: Map<classId, Set<day-period>>
    
    const teacherAvail = new Map<string, Set<string>>();
    const classAvail = new Map<string, Set<string>>();

    const getSlotKey = (day: string, period: number) => `${day}-${period}`;

    // 4. Determine how many periods each assignment needs
    // We use the subject coefficient as a proxy for the number of periods per week
    // if volumeHoraire is not set or 0.
    const toSchedule: { assignment: typeof assignments[0], periodsRemaining: number }[] = [];

    for (const a of assignments) {
        // Find subject coeff from section
        const cls = classes.find(c => c.id === a.classId);
        const sectionSubject = cls?.section?.subjects.find(s => s.subjectId === a.subjectId);
        let periods = a.volumeHoraire || sectionSubject?.coefficient || 2; // default 2
        toSchedule.push({ assignment: a, periodsRemaining: periods });
    }

    // Sort to schedule hardest constraints first (e.g. highest periods)
    toSchedule.sort((a, b) => b.periodsRemaining - a.periodsRemaining);

    const generatedSlots: any[] = [];
    const unscheduled: any[] = [];

    // 5. Greedy placement
    for (const item of toSchedule) {
        const { assignment } = item;
        const teacherId = assignment.teacherId;
        const clsId = assignment.classId;

        if (!teacherAvail.has(teacherId)) teacherAvail.set(teacherId, new Set());
        if (!classAvail.has(clsId)) classAvail.set(clsId, new Set());

        const tAvail = teacherAvail.get(teacherId)!;
        const cAvail = classAvail.get(clsId)!;

        while (item.periodsRemaining > 0) {
            let placed = false;

            // Find first available slot
            for (const day of days) {
                for (let p = 1; p <= periodsPerDay; p++) {
                    const slotKey = getSlotKey(day, p);
                    
                    if (!tAvail.has(slotKey) && !cAvail.has(slotKey)) {
                        // Place here
                        tAvail.add(slotKey);
                        cAvail.add(slotKey);
                        
                        // Fake start/end times based on period
                        // e.g. P1 = 07:30 - 08:20
                        const startMin = 450 + (p - 1) * 50; // starts at 7:30 (450 mins)
                        const endMin = startMin + 50;
                        const fmH = Math.floor(startMin / 60).toString().padStart(2, '0');
                        const fmM = (startMin % 60).toString().padStart(2, '0');
                        const toH = Math.floor(endMin / 60).toString().padStart(2, '0');
                        const toM = (endMin % 60).toString().padStart(2, '0');

                        generatedSlots.push({
                            teacherClassSubjectId: assignment.id,
                            dayOfWeek: day,
                            periodSlot: p,
                            startTime: `${fmH}:${fmM}`,
                            endTime: `${toH}:${toM}`,
                        });

                        placed = true;
                        item.periodsRemaining--;
                        break;
                    }
                }
                if (placed) break;
            }

            // If we couldn't place a period, break out to avoid infinite loop
            if (!placed) {
                unscheduled.push({
                    assignmentId: assignment.id,
                    subject: assignment.subject.name,
                    periodsMissing: item.periodsRemaining,
                });
                break;
            }
        }
    }

    // 6. Save slots
    if (generatedSlots.length > 0) {
        await prisma.timetablePeriod.createMany({
            data: generatedSlots,
        });
    }

    return {
        success: true,
        scheduledCount: generatedSlots.length,
        unscheduled,
    };
}
