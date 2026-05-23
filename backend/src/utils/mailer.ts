import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
    return null; // dev mode: no SMTP configured — we'll log links instead of sending
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: (env.SMTP_PORT ?? 587) === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    });
  }
  return transporter;
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const t = getTransporter();
  if (!t) {
    logger.warn(
      `[DEV] SMTP not configured — password reset link for ${to}: ${resetLink}`
    );
    return;
  }
  await t.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: 'DailySelfUpdate · 重置你的密码',
    text: `点击以下链接重置密码（1 小时内有效）：\n\n${resetLink}\n\n如果不是你本人的操作，请忽略此邮件。`,
    html: `<p>点击以下链接重置密码（1 小时内有效）：</p><p><a href="${resetLink}">${resetLink}</a></p><p>如果不是你本人的操作，请忽略此邮件。</p>`,
  });
}
