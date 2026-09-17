import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../mail/mail.service';

@Processor('otp-queue')
export class OtpProcessor extends WorkerHost {
  private readonly logger = new Logger(OtpProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<{ email: string; otp: string }>): Promise<any> {
    if (job.name === 'send-otp-email') {
      const { email, otp } = job.data;
      this.logger.log(`Processing send-otp-email job #${job.id} for ${email}`);
      await this.mailService.sendOtpEmail(email, otp);
      this.logger.log(`Successfully completed send-otp-email job #${job.id} for ${email}`);
    }
  }
}
