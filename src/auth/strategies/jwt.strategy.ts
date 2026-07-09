import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtStrategy.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                // 1. Сначала пробуем взять из куки (для браузера)
                (request: Request) => {
                    const token = request?.cookies?.access_token;
                    if (!token) {
                        this.logger.debug('[JwtStrategy]: ❌ No token found in cookies');
                    }
                    return token;
                },
                // 2. Потом пробуем из заголовка Authorization (для Swagger)
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }

    async validate(payload: JwtPayload) {
        this.logger.debug(`🔐 Validating user: ${payload.sub}`);
        const user = await this.authService.validateUser(payload.sub);

        if (!user) {
            throw new UnauthorizedException(`[JwtStrategy]: User with ID ${payload.sub} not found or inactive`);
        }

        return user;
    }
}