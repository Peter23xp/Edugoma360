import prisma from './src/lib/prisma';
import { settingsService } from './src/modules/settings/settings.service';

async function test() {
    try {
        const school = await prisma.school.findFirst();
        if (!school) {
            console.log('No school found');
            return;
        }
        console.log('Testing getAcademicYears for school:', school.id);
        const years = await settingsService.getAcademicYears(school.id);
        console.log('Academic Years found:', years.length);
    } catch (error) {
        console.error('ERROR DETECTED:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
