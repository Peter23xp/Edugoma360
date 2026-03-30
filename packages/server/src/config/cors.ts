import cors from 'cors';
import { env } from './env';

export const corsOptions = cors({
    origin: (origin, callback) => {
        // En mode dev, on accepte tout pour faciliter les tests sur mobile
        if (env.isDev) {
            callback(null, true);
        } else {
            const allowedOrigins = [env.CLIENT_URL, 'https://edugoma360.com'];
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});
