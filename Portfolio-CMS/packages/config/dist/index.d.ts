import { z } from 'zod';
declare const EnvSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodOptional<z.ZodEnum<["development", "test", "production"]>>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    DATABASE_URL: z.ZodOptional<z.ZodString>;
    SESSION_SECRET: z.ZodString;
    LEGACY_ADMIN_URL: z.ZodDefault<z.ZodString>;
    ALLOWED_ORIGINS: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string | undefined>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
    SESSION_SECRET: string;
    LEGACY_ADMIN_URL: string;
    ALLOWED_ORIGINS: string;
    DATABASE_URL?: string | undefined;
}, {
    SESSION_SECRET: string;
    NODE_ENV?: "development" | "test" | "production" | undefined;
    PORT?: number | undefined;
    DATABASE_URL?: string | undefined;
    LEGACY_ADMIN_URL?: string | undefined;
    ALLOWED_ORIGINS?: string | undefined;
}>;
export type Env = z.infer<typeof EnvSchema>;
/**
 * Load and validate environment variables once, throwing on invalid state to fail fast.
 */
export declare function loadEnvironment(): Env;
export {};
//# sourceMappingURL=index.d.ts.map