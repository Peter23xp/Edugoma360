import app from './app';
import { env } from './config/env';

const PORT = env.PORT;

app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║          🎓 EduGoma 360 API Server         ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║  🌐 URL:  http://localhost:${PORT}/api        ║`);
    console.log(`║  📊 Env:  ${env.NODE_ENV.padEnd(28)}║`);
    console.log(`║  🏙️  Ville: ${env.DEFAULT_VILLE.padEnd(27)}║`);
    console.log('╚════════════════════════════════════════════╝');
    console.log('');
});
