// src/auth/auth.service.ts
import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, UserRole } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, JwtRefreshPayload, Tokens } from './interfaces/jwt-payload.interface';
import { User } from '@prisma/client';
import { Response } from 'express';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }


    async register(dto: RegisterDto): Promise<Tokens> {

        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                passwordHash,
                role: dto.role || UserRole.CANDIDATE,
                status: 'active',
            },
        });

        if (user.role === UserRole.CANDIDATE) {
            await this.prisma.candidateProfile.create({
                data: {
                    userId: user.id,
                    fullName: dto.fullName,
                    city: dto.city,
                    isActive: true,
                },
            });
        } else if (user.role === UserRole.EMPLOYER) {
            await this.prisma.employerProfile.create({
                data: {
                    userId: user.id,
                    positionInCompany: dto.fullName,
                },
            });
        }

        this.logger.log(`✅ Registered user: ${user.email} (role: ${user.role})`);

        return this.generateTokens(user);
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

        if (user.status !== 'active') {
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

        if (!user || user.status !== 'active') {
            throw new UnauthorizedException('User not found or inactive');
        }

        const tokens = this.generateTokens(user);

        if (res) {
            this.setTokensInCookie(res, tokens.accessToken, tokens.refreshToken);
        }

        this.logger.log(`🔄 Tokens refreshed for user: ${user.email}`);

        return tokens;
    }

    async logout(userId: number): Promise<void> {
        // В production: добавить токен в blacklist (Redis)
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

        if (!user || user.status !== 'active') {
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
            secret: this.configService.get<string>('JWT_SECRET'),
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
}