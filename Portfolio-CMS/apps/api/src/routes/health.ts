import { Router } from 'express';

import { loadEnvironment } from '@portfolio-cms/config';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const env = loadEnvironment();
  res.json({
    status: 'ok',
    environment: env.NODE_ENV
  });
});
