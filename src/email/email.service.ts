import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailQueueService } from '@/email-queue/email-queue.service';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(
        private readonly emailQueueService: EmailQueueService,
        private configService: ConfigService
    ) { }

    async sendConfirmationEmail(email: string, token: string): Promise<void> {
        const confirmationUrl = `${this.configService.get<string>('API_URL')}/auth/confirm-email?token=${token}`;

        await this.emailQueueService.sendConfirmationEmail(
            email,
            confirmationUrl,
        );

        this.logger.log(`📨 Confirmation email queued for ${email}`);
    }

    async sendPasswordResetEmail(email: string, token: string) {
        const resetUrl = `${this.configService.get<string>('API_URL')}/auth/reset-password?token=${token}`;

        await this.emailQueueService.sendPasswordResetEmail(
            email,
            resetUrl,
        );

        this.logger.log(`📨 Password reset email queued for ${email}`);
    }

}