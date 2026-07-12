import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

export const env = {
  DATABASE_URL: requireEnv('DATABASE_URL'),
  JWT_SECRET:   requireEnv('JWT_SECRET'),
  PORT:         parseInt(process.env.PORT ?? '3001', 10),
  NODE_ENV:     process.env.NODE_ENV ?? 'development',
} as const;
