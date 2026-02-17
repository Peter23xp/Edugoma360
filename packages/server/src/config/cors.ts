import cors from 'cors';
import { env } from './env';

export const corsOptions = cors({
    origin: env.isDev
        ? ['http://localhost:5173', 'http://localhost:3000']
        : env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});
