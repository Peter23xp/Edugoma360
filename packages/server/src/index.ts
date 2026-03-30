import app from './app';
import { env } from './config/env';
import { initTeacherCron } from './modules/teachers/teachers.cron';
import { initPaymentsCron } from './modules/payments/payments.cron';

initTeacherCron();
initPaymentsCron();

const PORT = env.PORT;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log('');
    console.log('============================================');
    console.log('       EduGoma 360 API Server');
    console.log('============================================');
    console.log(`  Local:   http://localhost:${PORT}/api`);
    console.log(`  Network: http://192.168.1.106:${PORT}/api`);
    console.log(`  Env:     ${env.NODE_ENV}`);
    console.log(`  Ville:   ${env.DEFAULT_VILLE}`);
    console.log('============================================');
    console.log('');
});
