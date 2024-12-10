import { z } from 'zod';

const envSchema = z.object({
  MODE: z.string().default('development')
});

const env = envSchema.parse(import.meta.env);

const PROD_URL = 'https://knight-cz-weighted-town.trycloudflare.com';
const DEV_URL = 'http://localhost:3000';

export const SERVER_CONFIG = {
  API_URL: env.MODE === 'production' ? PROD_URL : DEV_URL,
  ENVIRONMENT: env.MODE,
  IS_DEVELOPMENT: env.MODE === 'development',
  IS_PRODUCTION: env.MODE === 'production'
};