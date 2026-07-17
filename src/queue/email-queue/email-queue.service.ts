import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { loadTemplate } from '@/shared/utils/template-loader';
import { EmailType } from '@/shared/enums/enums';


export interface EmailJobData {
    to: string;
    subject: string;
    html: string;
    type: EmailType;
}

@Injectable()
export class EmailQueueService {
    private readonly logger = new Logger(EmailQueueService.name);

    constructor(
        @InjectQueue('email') private readonly emailQueue: Queue,
    ) { }


    async sendEmail(data: EmailJobData): Promise<void> {
        const job = await this.emailQueue.add('send-email', data, {
            priority: data.type === EmailType.CONFIRMATION ? 1 : 5,
            removeOnComplete: true,
            removeOnFail: 1000,
        });

        this.logger.log(
            `📨 Email job added to queue: ${job.id} (to: ${data.to}, type: ${data.type})`,
        );
    }

    async sendConfirmationEmail(
        email: string,
        confirmationUrl: string,
    ): Promise<void> {
        const html = loadTemplate('confirmation', {
            confirmationUrl,
            year: new Date().getFullYear().toString(),
        });

        await this.sendEmail({
            to: email,
            subject: 'Подтверждение регистрации',
            html,
            type: EmailType.CONFIRMATION,
        });
    }

    async sendPasswordResetEmail(
        email: string,
        resetUrl: string,
    ): Promise<void> {
        const html = loadTemplate('password-reset', {
            resetUrl,
            year: new Date().getFullYear().toString(),
        });

        await this.sendEmail({
            to: email,
            subject: 'Сброс пароля',
            html,
            type: EmailType.PASSWORD_RESET,
        });
    }

    async sendNotification(
        email: string,
        subject: string,
        templateName: string,
        variables: Record<string, string>,
    ): Promise<void> {
        const html = loadTemplate(templateName, {
            ...variables,
            year: new Date().getFullYear().toString(),
        });

        await this.sendEmail({
            to: email,
            subject,
            html,
            type: EmailType.NOTIFICATION,
        });
    }


    async getQueueStats() {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            this.emailQueue.getWaitingCount(),
            this.emailQueue.getActiveCount(),
            this.emailQueue.getCompletedCount(),
            this.emailQueue.getFailedCount(),
            this.emailQueue.getDelayedCount(),
        ]);

        return {
            waiting,
            active,
            completed,
            failed,
            delayed,
            total: waiting + active + completed + failed + delayed,
        };
    }

    /**
     * Получить задачи из очереди
     */
    async getQueueJobs() {
        const [waiting, active, completed, failed] = await Promise.all([
            this.emailQueue.getJobs(['waiting'], 0, 10, true),
            this.emailQueue.getJobs(['active'], 0, 10, true),
            this.emailQueue.getJobs(['completed'], 0, 10, true),
            this.emailQueue.getJobs(['failed'], 0, 10, true),
        ]);

        return {
            waiting: waiting.map((j) => ({
                id: j.id,
                data: j.data,
                timestamp: j.timestamp,
            })),
            active: active.map((j) => ({
                id: j.id,
                data: j.data,
                timestamp: j.timestamp,
            })),
            completed: completed.map((j) => ({
                id: j.id,
                data: j.data,
                finishedOn: j.finishedOn,
            })),
            failed: failed.map((j) => ({
                id: j.id,
                data: j.data,
                failedReason: j.failedReason,
                finishedOn: j.finishedOn,
            })),
        };
    }
}