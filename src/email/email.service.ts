import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { loadTemplate } from '@/shared/utils/template-loader';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT'),
            secure: false,
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASSWORD'),
            },
        });

        this.transporter.verify((error, success) => {
            if (error) {
                this.logger.error(`❌ SMTP connection failed: ${error.message}`);
            } else {
                this.logger.log('✅ SMTP server is ready to send emails');
            }
        });
    }

    async sendConfirmationEmail(email: string, token: string) {
        const confirmationUrl = `${this.configService.get<string>('API_URL')}/auth/confirm-email?token=${token}`;

        const html = loadTemplate('confirmation', {
            CONFIRMATION_URL: confirmationUrl,
        });

        const mailOptions = {
            from: `"Career Platform" <${this.configService.get<string>('SMTP_FROM')}>`,
            to: email,
            subject: 'Подтверждение регистрации',
            html
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`✅ Confirmation email sent to ${email}`);
        } catch (error) {
            this.logger.error(`❌ Failed to send email to ${email}`);
            throw new Error('Failed to send confirmation email');
        }
    }

    async sendPasswordResetEmail(email: string, token: string) {
        const resetUrl = `${this.configService.get<string>('API_URL')}/auth/reset-password?token=${token}`;

        const html = loadTemplate('password-reset', {
            RESET_URL: resetUrl,
        });

        const mailOptions = {
            from: `"Career Platform" <${this.configService.get<string>('SMTP_FROM')}>`,
            to: email,
            subject: 'Сброс пароля',
            html
        };

        await this.transporter.sendMail(mailOptions);
    }
}