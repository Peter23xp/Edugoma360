import dotenv from 'dotenv';
dotenv.config();

export const env = {
    // Database
    DATABASE_URL: process.env.DATABASE_URL ?? 'file:./dev.db',

    // JWT
    JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-change-me-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '8h',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',

    // Africa's Talking
    AT_API_KEY: process.env.AT_API_KEY ?? '',
    AT_USERNAME: process.env.AT_USERNAME ?? 'sandbox',
    AT_SENDER_ID: process.env.AT_SENDER_ID ?? 'EduGoma360',
    AT_ENV: (process.env.AT_ENV ?? 'sandbox') as 'sandbox' | 'production',

    // Storage
    STORAGE_TYPE: process.env.STORAGE_TYPE ?? 'local',
    STORAGE_LOCAL_PATH: process.env.STORAGE_LOCAL_PATH ?? './uploads',

    // App
    PORT: parseInt(process.env.PORT ?? '3000', 10),
    CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
    NODE_ENV: process.env.NODE_ENV ?? 'development',

    // School defaults
    DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY ?? 'FC',
    DEFAULT_PROVINCE: process.env.DEFAULT_PROVINCE ?? 'Nord-Kivu',
    DEFAULT_VILLE: process.env.DEFAULT_VILLE ?? 'Goma',
    EXCHANGE_RATE_FC_USD: parseInt(process.env.EXCHANGE_RATE_FC_USD ?? '2500', 10),

    // Security
    MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS ?? '3', 10),
    LOCKOUT_DURATION_MINUTES: parseInt(process.env.LOCKOUT_DURATION_MINUTES ?? '15', 10),
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),

    // Sync
    OFFLINE_SYNC_INTERVAL_MS: parseInt(process.env.OFFLINE_SYNC_INTERVAL_MS ?? '300000', 10),
    SYNC_BATCH_SIZE: parseInt(process.env.SYNC_BATCH_SIZE ?? '100', 10),

    // Helpers
    get isDev() { return this.NODE_ENV === 'development'; },
    get isProd() { return this.NODE_ENV === 'production'; },
};
