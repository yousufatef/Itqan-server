import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import { passwordResetTemplate } from './templates/password-reset.template';

@Injectable()
export class MailService {
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    this.resend = new Resend(apiKey);
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const mailFrom =
      this.configService.get<string>('MAIL_FROM') ||
      'noreply@yourdomain.com';

    const appName =
      this.configService.get<string>('APP_NAME') || 'YourApp';

    const { error } = await this.resend.emails.send({
      from: `${appName} <${mailFrom}>`,
      to: email,
      subject: 'Reset your password',
      html: passwordResetTemplate(appName, otp),
    });

    if (error) {
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  }
}