import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { loadEnvironment } from '@portfolio-cms/config';
import { logger } from './logger';
import { healthRouter } from './routes/health';
import { v1Router } from './routes/v1';
import { v2Router } from './routes/v2';
export function createApp() {
    const app = express();
    const env = loadEnvironment();
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    app.set('trust proxy', 1);
    app.use(helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                'default-src': ["'self'"],
                'script-src': ["'self'"],
                'style-src': ["'self'", "'unsafe-inline'"],
                'img-src': ["'self'", 'data:'],
                'connect-src': ["'self'", ...allowedOrigins]
            }
        }
    }));
    app.use(cors({
        origin: allowedOrigins.length ? allowedOrigins : undefined,
        credentials: true
    }));
    app.use(express.json({ limit: '2mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('combined'));
    app.use(session({
        name: 'cms.sid',
        secret: env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: 'lax',
            secure: env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 6 // 6 hours
        }
    }));
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 500,
        standardHeaders: true,
        legacyHeaders: false
    }));
    app.use(pinoHttp({
        logger,
        customLogLevel(_, res, err) {
            if (res.statusCode >= 500 || err)
                return 'error';
            if (res.statusCode >= 400)
                return 'warn';
            return 'info';
        }
    }));
    app.get('/api/v1/legacy-admin', (_req, res) => {
        // Provide a feature-flagged fallback entry point to the current admin UI.
        res.json({ redirectUrl: env.LEGACY_ADMIN_URL });
    });
    app.use('/api/v1', v1Router);
    app.use('/api/v2', v2Router);
    app.use('/api/health', healthRouter);
    app.use((_req, res) => {
        res.status(404).json({ message: 'Not Found' });
    });
    app.use((error, _req, res, _next) => {
        logger.error({ err: error }, 'Unhandled error');
        res.status(500).json({ message: 'Internal Server Error' });
    });
    return app;
}
