import prisma from './src/lib/prisma';
import { settingsService } from './src/modules/settings/settings.service';

async function test() {
    try {
        const school = await prisma.school.findFirst();
        if (!school) return;
        
        console.log('Creating test academic year...');
        const year = await settingsService.createAcademicYear(school.id, {
            label: 'TEST-2025',
            startDate: '2025-09-01',
            endDate: '2026-06-30',
            terms: [
                { number: 1, label: 'T1', startDate: '2025-09-01', endDate: '2025-12-31' }
            ]
        });
        console.log('Year created:', year.id);
    } catch (error) {
        console.error('CREATE ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
