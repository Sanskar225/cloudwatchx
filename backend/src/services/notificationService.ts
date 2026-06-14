import axios from 'axios';
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';

interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  server: string;
  metric: string;
  value: number;
  threshold: number;
  severity: string;
  [key: string]: unknown;
}

export const notificationService = {
  send: async (payload: NotificationPayload) => {
    const tasks: Promise<void>[] = [];

    if (process.env.SLACK_WEBHOOK_URL) tasks.push(notificationService.sendSlack(payload));
    if (process.env.DISCORD_WEBHOOK_URL) tasks.push(notificationService.sendDiscord(payload));
    if (process.env.SMTP_HOST && process.env.ALERT_EMAIL_TO) tasks.push(notificationService.sendEmail(payload));

    await Promise.allSettled(tasks);

    await prisma.notification.create({
data: { type: payload.type, payload: JSON.parse(JSON.stringify(payload)), sent: true },    });
  },

  sendSlack: async (payload: NotificationPayload) => {
    try {
      await axios.post(process.env.SLACK_WEBHOOK_URL!, {
        text: `🚨 *${payload.title}*\n*Server:* ${payload.server}\n*Metric:* ${payload.metric}: ${payload.value.toFixed(2)} (threshold: ${payload.threshold})\n*Severity:* ${payload.severity}`,
      });
    } catch (err) {
      logger.error('Slack notification failed:', err);
    }
  },

  sendDiscord: async (payload: NotificationPayload) => {
    try {
      const color = payload.severity === 'CRITICAL' ? 0xff0000 : payload.severity === 'HIGH' ? 0xff8c00 : 0xffff00;
      await axios.post(process.env.DISCORD_WEBHOOK_URL!, {
        embeds: [{
          title: payload.title,
          description: payload.message,
          color,
          fields: [
            { name: 'Server', value: payload.server, inline: true },
            { name: 'Metric', value: payload.metric, inline: true },
            { name: 'Value', value: payload.value.toFixed(2), inline: true },
          ],
          timestamp: new Date().toISOString(),
        }],
      });
    } catch (err) {
      logger.error('Discord notification failed:', err);
    }
  },

  sendEmail: async (payload: NotificationPayload) => {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'cloudwatchx@example.com',
        to: process.env.ALERT_EMAIL_TO,
        subject: `[CloudWatchX] ${payload.title}`,
        html: `<h2>${payload.title}</h2><p>${payload.message}</p><table><tr><td>Server</td><td>${payload.server}</td></tr><tr><td>Metric</td><td>${payload.metric}: ${payload.value.toFixed(2)}</td></tr><tr><td>Severity</td><td>${payload.severity}</td></tr></table>`,
      });
    } catch (err) {
      logger.error('Email notification failed:', err);
    }
  },
};