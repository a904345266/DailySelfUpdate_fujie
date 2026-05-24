import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import recordsRoutes from './routes/recordsRoutes';
import historyRoutes from './routes/historyRoutes';
import dataRoutes from './routes/dataRoutes';
import analysisRoutes from './routes/analysisRoutes';
import vipRoutes from './routes/vipRoutes';

export function createApp() {
  const app = express();

  // Trust the first proxy hop when behind a reverse proxy / Tailscale Funnel
  // (both add X-Forwarded-For). Always on in production; in dev it's opt-in via
  // TRUST_PROXY=true so express-rate-limit doesn't error on the forwarded header.
  if (env.NODE_ENV === 'production' || env.TRUST_PROXY) {
    app.set('trust proxy', 1);
  }

  app.disable('x-powered-by');
  app.use(
    helmet({
      // We're an API; the frontend lives elsewhere — relaxed CSP defaults are fine.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  const allowedOrigins = env.FRONTEND_URL.split(',').map((s) => s.trim()).filter(Boolean);
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow same-origin / non-browser requests (no Origin header) and any
        // configured frontend origin.
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
  });

  // Serve generated cover images (downloaded locally so they never expire).
  // Mounted under /api/uploads so it rides the same proxy/base-url the frontend
  // already uses (Caddy routes /api/* → backend; direct mode points at :3001/api).
  app.use('/api/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  app.use('/api/auth', authRoutes);
  app.use('/api/records', recordsRoutes);
  app.use('/api/records', historyRoutes);
  app.use('/api/data', dataRoutes);
  app.use('/api/analysis', analysisRoutes);
  app.use('/api/vip', vipRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
