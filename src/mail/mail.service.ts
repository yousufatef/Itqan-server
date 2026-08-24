import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const mailFrom = this.configService.get<string>('MAIL_FROM') || 'noreply@yourdomain.com';

    const { error } = await this.resend.emails.send({
      from: `YourApp <${mailFrom}>`,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <p>Your OTP code is:</p>
        <h2>${otp}</h2>
        <p>This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
      `,
    });

    if (error) {
      throw new Error(`Failed to send OTP email: ${error.message}`);
    }
  }
}