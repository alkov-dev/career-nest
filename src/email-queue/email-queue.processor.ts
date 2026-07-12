import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailJobData } from './email-queue.service';

@Processor('email')
export class EmailQueueProcessor extends WorkerHost {

    private readonly logger = new Logger(EmailQueueProcessor.name);
    private transporter!: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        super();
    }

    async onModuleInit() {
        this.createTransporter();
        await this.verifyTransporter();
    }

    private createTransporter() {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT'),
            secure: false,
            pool: true,
            maxConnections: 10,
            maxMessages: 100,
            rateLimit: 100,
            rateDelta: 1000,
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASSWORD'),
            },
        });
    }

    private async verifyTransporter() {
        try {
            await this.transporter.verify();
            this.logger.log('✅ SMTP server is ready to send emails');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`❌ SMTP connection failed: ${errorMessage}`);
            throw error;
        }
    }

    async process(job: Job<EmailJobData>): Promise<any> {
        const { to, subject, html, type } = job.data;

        this.logger.log(
            `📤 Processing email job ${job.id}: sending ${type} email to ${to}`,
        );

        try {
            const mailOptions = {
                from: `"Career Platform" <${this.configService.get<string>('SMTP_FROM')}>`,
                to,
                subject,
                html,
            };

            const info = await this.transporter.sendMail(mailOptions);

            this.logger.log(
                `✅ Email sent successfully to ${to} (job ${job.id}): ${info.messageId}`,
            );

            return { success: true, messageId: info.messageId };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : 'No stack';

            this.logger.error(
                `❌ Failed to send email to ${to} (job ${job.id}): ${errorMessage}`,
                errorStack,
            );

            throw error;
        }
    }
}