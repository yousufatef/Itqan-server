import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from './mail.service';

@Processor('mail')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<{ email: string; otp: string }>): Promise<any> {
    switch (job.name) {
      case 'send-otp': {
        const { email, otp } = job.data;
        this.logger.log(`Processing send-otp job #${job.id} for ${email}`);
        await this.mailService.sendOtpEmail(email, otp);
        this.logger.log(`Successfully completed send-otp job #${job.id} for ${email}`);
        break;
      }
      default:
        this.logger.warn(`Unknown job name ${job.name} on mail queue`);
        break;
    }
  }
}
