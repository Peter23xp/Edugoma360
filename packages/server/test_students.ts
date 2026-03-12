import { studentsService } from './src/modules/students/students.service';

async function test() {
    try {
        const res = await studentsService.getStudents('school-001', { search: 'NK-GOM', limit: 5 });
        console.log('SUCCESS:', res.data.length);
    } catch (e: any) {
        console.error('ERROR:', e.message);
        console.error(e.stack);
    }
}

test();
