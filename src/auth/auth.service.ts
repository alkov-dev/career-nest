import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    Logger,
    BadRequestException,
    InternalServerErrorException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { JwtPayload, JwtRefreshPayload, Tokens } from './interfaces/jwt-payload.interface';
import { User } from '@prisma/client';
import { Response } from 'express';
import { LoginDto, RegisterDto } from '@/shared/dto/auth.dto';
import { userSelect } from '@/shared/constants/selects';
import { EmailService } from '@/email/email.service';
import { RequestPasswordResetDto } from '@/shared/dto/request-password-reset.dto';
import { UserStatus, UserRole } from '@/shared/enums/enums';
import { ResetPasswordDto } from '@/shared/dto/reset-password.dto';
import { CreateHrUserDto, RegisterCompanyDto, RegisterCompanyResponseDto } from '@/shared/dto/register-company.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private emailService: EmailService,
    ) { }


    async register(dto: RegisterDto): Promise<Tokens> {

        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const emailConfirmToken = crypto.randomBytes(32).toString('hex');
        const emailConfirmExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

        const user = await this.prisma.$transaction(async (tx) => {
            const createdUser = await tx.user.create({
                data: {
                    email: dto.email.toLowerCase(),
                    passwordHash,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    role: dto.role || UserRole.CANDIDATE,
                    status: UserStatus.PENDING,
                    emailConfirmToken,
                    emailConfirmExpires,
                },
            });

            await tx.candidateProfile.create({
                data: {
                    userId: createdUser.id,
                    city: dto.city,
                    isActive: true,
                    summary: dto.summary
                },
            });

            return createdUser;
        });


        await this.emailService.sendConfirmationEmail(user.email, emailConfirmToken);

        this.logger.log(`✅ User registered: ${user.email} (pending confirmation)`);

        return this.generateTokens(user);
    }

    async confirmEmail(token: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                emailConfirmToken: token,
                emailConfirmExpires: {
                    gte: new Date(),
                },
            },
        });

        if (!user) {
            throw new BadRequestException('Недействительный или истёкший токен');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                status: UserStatus.ACTIVE,
                emailConfirmToken: null,
                emailConfirmExpires: null,
            },
        });

        this.logger.log(`✅ Email confirmed for user: ${user.email}`);

        return {
            message: 'Email успешно подтверждён. Теперь вы можете войти.',
        };
    }

    async resendConfirmationEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new BadRequestException('Пользователь не найден');
        }

        if (user.status === UserStatus.ACTIVE) {
            throw new BadRequestException('Email уже подтверждён');
        }

        const emailConfirmToken = crypto.randomBytes(32).toString('hex');
        const emailConfirmExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                emailConfirmToken,
                emailConfirmExpires,
            },
        });

        await this.emailService.sendConfirmationEmail(user.email, emailConfirmToken);

        return { message: 'Письмо с подтверждением отправлено повторно' };
    }

    async login(dto: LoginDto): Promise<Tokens> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email.toLowerCase(),
                deletedAt: null,
            },
        });

        if (!user) {
            this.logger.warn(`[AuthService]: ❌ Login failed: user not found (${dto.email})`);
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.status !== UserStatus.ACTIVE) {
            this.logger.warn(`[AuthService]: ❌ Login failed: account not active (${dto.email})`);
            throw new UnauthorizedException('Account is not active');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

        if (!isPasswordValid) {
            this.logger.warn(`[AuthService]: ❌ Login failed: invalid password (${dto.email})`);
            throw new UnauthorizedException('Invalid credentials');
        }

        this.logger.log(`✅ User logged in: ${user.email}`);

        return this.generateTokens(user);
    }

    async refreshToken(refreshToken: string, res?: Response): Promise<Tokens> {

        let payload: any;
        try {
            payload = this.jwtService.verify(refreshToken, {

                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),

            });
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id: BigInt(payload.sub),
                deletedAt: null,
            },
        });


        if (!user || user.status !== UserStatus.ACTIVE) {
            throw new UnauthorizedException('User not found or inactive');
        }

        const tokens = this.generateTokens(user);

        this.logger.log(`🔄 Tokens refreshed for user: ${user.email}`);

        return tokens;
    }

    async logout(userId: number): Promise<void> {
        this.logger.log(`👋 User logged out: ${userId}`);
    }

    /**
     * Валидация пользователя (для JwtStrategy)
     * ВАЖНО: возвращает null, а не бросает исключение!
     */
    async validateUser(userId: number): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: BigInt(userId),
                deletedAt: null,
            },
            include: {
                candidateProfile: true,
                employerProfile: true,
            },
        });

        if (!user || user.status !== UserStatus.ACTIVE) {
            return null;
        }

        return user;
    }

    private generateTokens(user: User): Tokens {

        const accessPayload: JwtPayload = {
            sub: Number(user.id),
            email: user.email,
            role: user.role,
        };

        const refreshPayload: JwtRefreshPayload = {
            sub: Number(user.id),
        };


        const accessToken = this.jwtService.sign(accessPayload, {
            expiresIn: '15m',
            secret: this.configService.get<string>('JWT_SECRET')!,
        });

        const refreshToken = this.jwtService.sign(refreshPayload, {
            expiresIn: '7d',
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        });


        return { user, accessToken, refreshToken };
    }

    setTokensInCookie(res: Response, accessToken: string, refreshToken: string) {
        const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: '/',
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        });
    }

    clearTokensFromCookie(res: Response) {
        res.clearCookie('access_token', { path: '/' });
        res.clearCookie('refresh_token', { path: '/' });
    }

    private async validateUserCredentials(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email, deletedAt: null },
        });

        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    async aboutMe(id: string) {
        const profile = await this.prisma.user.findUnique({
            where: { id: BigInt(id) },
            select: userSelect,
        });

        return profile
    }

    async requestPasswordReset(dto: RequestPasswordResetDto) {
        this.logger.log(`🔐 Password reset requested for: ${dto.email}`);

        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            this.logger.warn(`⚠️ Password reset requested for non-existent email: ${dto.email}`);
            return { message: 'Если пользователь с таким email существует, письмо отправлено' };
        }

        if (user.status !== UserStatus.ACTIVE) {
            throw new BadRequestException('Аккаунт не активирован');
        }

        const passwordResetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 час


        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken,
                passwordResetExpires,
            },
        });

        await this.emailService.sendPasswordResetEmail(user.email, passwordResetToken);

        return { message: 'Если пользователь с таким email существует, письмо отправлено' };
    }

    async resetPassword(dto: ResetPasswordDto) {
        this.logger.log(`🔐 Password reset attempt with token`);

        const user = await this.prisma.user.findUnique({
            where: {
                passwordResetToken: dto.token,
                passwordResetExpires: {
                    gte: new Date(),
                },
            },
        });

        if (!user) {
            throw new BadRequestException('Недействительный или истёкший токен');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });

        this.logger.log(`✅ Password reset successful for user: ${user.email}`);

        return { message: 'Пароль успешно изменён' };
    }

    async companyRegistration(
        dto: RegisterCompanyDto,
    ): Promise<RegisterCompanyResponseDto> {

        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Пользователь с таким email уже зарегистрирован');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);
        const emailConfirmToken = crypto.randomBytes(32).toString('hex');
        const emailConfirmExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа


        //User -> Company -> EmployerProfile 
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        email: dto.email,
                        passwordHash,
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                        role: UserRole.ADMIN,
                        status: UserStatus.PENDING,
                        emailConfirmToken,
                        emailConfirmExpires,
                    },
                });

                const company = await tx.company.create({
                    data: {
                        name: dto.companyName,
                        description: dto.description,
                        size: dto.size,
                        industry: dto.industry,
                        values: dto.values,
                        logoUrl: dto.logoUrl,
                        website: dto.website,
                        headOffice: dto.headOffice,
                        linkedinUrl: dto.linkedin,
                        benefits: dto.benefits,
                        corporateCulture: dto.corporateCulture,
                        employeeCount: dto.employeeCount,
                    },
                });

                await tx.employerProfile.create({
                    data: {
                        userId: user.id,
                        companyId: company.id,
                        positionInCompany: dto.positionInCompany || 'Administrator',
                    },
                });

                await this.emailService.sendConfirmationEmail(user.email, emailConfirmToken);

                this.logger.log(`✅ Company registered: ${user.email} (pending confirmation)`);

                return {
                    userId: user.id.toString(),
                    companyId: company.id.toString(),
                    email: user.email,
                };
            });


            return {
                ...result,
                message: 'Компания и администратор успешно созданы',
            };
        } catch (error) {
            throw new InternalServerErrorException(
                'Не удалось зарегистрировать компанию: ' + + (error as Error).message,
            );
        }
    }

    private parseBigInt(value: string, fieldName: string): bigint {
        try {
            return BigInt(value);
        } catch (error) {
            throw new BadRequestException(`Некорректный формат ${fieldName}. Ожидалось число.`);
        }
    }

    async createHrUser(dto: CreateHrUserDto, adminId: bigint) {
        const companyIdBigInt = this.parseBigInt(dto.companyId, 'companyId');

        const company = await this.prisma.company.findUnique({
            where: { id: companyIdBigInt },
        });

        if (!company) {
            throw new NotFoundException(`Компания с ID ${dto.companyId} не найдена в системе`);
        }

        const admin = await this.prisma.user.findUnique({
            where: { id: adminId },
        });

        if (!admin) {
            throw new ForbiddenException('Администратор не найден');
        }

        if (admin.status !== UserStatus.ACTIVE) {
            throw new ForbiddenException('Ваш аккаунт неактивен');
        }

        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Пользователь с таким email уже существует');
        }

        const tempPassword = crypto.randomUUID().slice(0, 8);
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        const inviteToken = crypto.randomUUID();
        const inviteExpires = new Date();
        inviteExpires.setDate(inviteExpires.getDate() + 7);

        return this.prisma.$transaction(async (tx) => {

            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    role: UserRole.HR_MANAGER,
                    status: UserStatus.ACTIVE,
                    passwordHash,
                    passwordResetToken: inviteToken,
                    passwordResetExpires: inviteExpires,
                },
            });

            await tx.employerProfile.create({
                data: {
                    userId: user.id,
                    companyId: companyIdBigInt,
                    positionInCompany: 'HR-менеджер',
                },
            });

            return user;
        });
    }

}