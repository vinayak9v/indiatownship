import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth.routes';
import { propertyRouter } from './routes/property.routes';
import { leadRouter } from './routes/lead.routes';
import { userRouter } from './routes/user.routes';
import { adminRouter } from './routes/admin.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*', credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(morgan(process.env.NODE_ENV === 'test' ? 'silent' : 'dev'));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/v1/auth', authRouter);
  app.use('/v1/properties', propertyRouter);
  app.use('/v1/leads', leadRouter);
  app.use('/v1/users', userRouter);
  app.use('/v1/admin', adminRouter);

  app.use(errorHandler);

  return app;
}
