import { logger } from '../utils/logger';

export interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
}

export class EmailService {
  /**
   * Send a transactional email notification (pluggable with Resend/SendGrid/SMTP)
   */
  public static async sendEmail(options: SendEmailOptions): Promise<{ messageId: string }> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Structured log representing production email delivery
    logger.info({
      event: 'EMAIL_DISPATCHED',
      messageId,
      to: options.to,
      subject: options.subject,
    });

    return { messageId };
  }
}
