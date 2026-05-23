import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  // Comma-separated list of allowed origins (for CORS).
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  // Trust the first proxy hop. Set true when behind a reverse proxy / Tailscale
  // Funnel (which adds X-Forwarded-For) so rate-limiting & req.ip work correctly.
  TRUST_PROXY: z
    .string()
    .default('false')
    .transform((v) => v === 'true' || v === '1'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 chars'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  REFRESH_TOKEN_SECRET: z.string().min(16, 'REFRESH_TOKEN_SECRET must be at least 16 chars'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  PASSWORD_RESET_TOKEN_EXPIRES_IN: z.string().default('1h'),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().default('noreply@dailyselfupdate.com'),

  LOG_LEVEL: z.string().default('info'),

  // --- AI (all optional; absence → rule-based insights) ---
  AI_ENABLED: z
    .string()
    .default('false')
    .transform((v) => v === 'true' || v === '1'),
  AI_TIMEOUT_MS: z.coerce.number().default(15000),
  AI_FREE_PROVIDER: z.enum(['openai', 'deepseek', 'claude']).default('deepseek'),
  AI_VIP_PROVIDER: z.enum(['openai', 'deepseek', 'claude']).default('claude'),

  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().default('https://api.openai.com/v1'),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_BASE_URL: z.string().default('https://api.deepseek.com'),
  DEEPSEEK_MODEL: z.string().default('deepseek-chat'),

  ANTHROPIC_API_KEY: z.string().optional(),
  // Optional: a token for an Anthropic-compatible gateway (e.g. self-hosted
  // new-api proxy fronting GLM). Used in place of ANTHROPIC_API_KEY when set.
  ANTHROPIC_AUTH_TOKEN: z.string().optional(),
  // Optional: custom Anthropic-compatible base URL (the gateway endpoint).
  ANTHROPIC_BASE_URL: z.string().optional(),
  CLAUDE_MODEL: z.string().default('claude-haiku-4-5-20251001'),

  // --- VIP trial redemption ---
  // The current valid redemption code. Empty → redemption disabled.
  VIP_TRIAL_CODE: z.string().optional(),
  VIP_TRIAL_DURATION_HOURS: z.coerce.number().default(24),

  // --- Weekly summary cover image (text-to-image; ALL OPTIONAL) ---
  // If disabled/unconfigured, summaries simply have no cover image — no error.
  IMAGE_ENABLED: z
    .string()
    .default('false')
    .transform((v) => v === 'true' || v === '1'),
  IMAGE_TIMEOUT_MS: z.coerce.number().default(30000),
  // OpenAI-style /v1/images/generations endpoint (works with new-api gateway,
  // 智谱 CogView via gateway, OpenAI DALL·E, etc.)
  IMAGE_API_KEY: z.string().optional(),
  IMAGE_BASE_URL: z.string().optional(),
  IMAGE_MODEL: z.string().default('cogview-3'),
  IMAGE_SIZE: z.string().default('1024x1024'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

// Block the dev placeholder secrets in production — these are committed in
// .env.example and would silently be loaded if the operator forgot to set them.
if (env.NODE_ENV === 'production') {
  const placeholders = [
    'replace-me-with-a-long-random-string-in-production',
    'replace-me-with-a-different-long-random-string',
  ];
  if (placeholders.includes(env.JWT_SECRET) || placeholders.includes(env.REFRESH_TOKEN_SECRET)) {
    // eslint-disable-next-line no-console
    console.error('JWT secrets are still set to development placeholders. Refusing to start.');
    process.exit(1);
  }
}
