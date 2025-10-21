import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).optional().default('development'),
  PORT: z.coerce.number().int().min(1024).max(65535).default(4000),
  DATABASE_URL: z.string().url().optional(),
  SESSION_SECRET: z.string().min(16, 'SESSION_SECRET must be at least 16 characters long'),
  LEGACY_ADMIN_URL: z.string().url().default('http://localhost:3000/admin'),
  ALLOWED_ORIGINS: z
    .string()
    .optional()
    .transform((value) => value ?? '')
});

export type Env = z.infer<typeof EnvSchema>;

let cachedEnv: Env | null = null;

/**
 * Load and validate environment variables once, throwing on invalid state to fail fast.
 */
export function loadEnvironment(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  loadEnv({ path: process.env.ENV_FILE ?? '.env' });
  const parsed = EnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
