import app from './app';
import { env } from './config/env';
import { initTeacherCron } from './modules/teachers/teachers.cron';

initTeacherCron();

const PORT = env.PORT;

app.listen(PORT, () => {
    console.log('');
    console.log('============================================');
    console.log('       EduGoma 360 API Server');
    console.log('============================================');
    console.log(`  URL:   http://localhost:${PORT}/api`);
    console.log(`  Env:   ${env.NODE_ENV}`);
    console.log(`  Ville: ${env.DEFAULT_VILLE}`);
    console.log('============================================');
    console.log('');
});
