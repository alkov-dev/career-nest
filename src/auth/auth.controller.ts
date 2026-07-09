import {
    Controller,
    Post,
    Get,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Res,
    Request,
    UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginResponseDto, RefreshResponseDto, RegisterResponseDto, UserResponseDto } from './dto/auth-responses.dto';
import { User } from '@prisma/client';


@ApiTags('Auth')
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Регистрация нового пользователя' })
    @ApiResponse({
        status: 201,
        description: 'Пользователь успешно зарегистрирован',
        type: RegisterResponseDto,
    })
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.login(dto);
        this.authService.setTokensInCookie(res, tokens.accessToken, tokens.refreshToken);
        return { message: 'Пользователь успешно зарегистрирован' };
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Вход в систему' })
    @ApiResponse({
        status: 200,
        description: 'Успешный вход. Токены устанавливаются в HttpOnly cookies.',
        type: LoginResponseDto,
    })
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.login(dto);
        this.authService.setTokensInCookie(res, tokens.accessToken, tokens.refreshToken);

        // ⚠️ Токены в body ТОЛЬКО для development для сваггера
        const isDev = process.env.NODE_ENV !== 'production';

        if (isDev) {
            return {
                user: tokens.user,
                accessToken: tokens.accessToken,
            };
        }
        return {
            message: 'Пользователь успешно вошел в систему',
            user: tokens.user,
        };

    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Обновление токенов' })
    @ApiResponse({
        status: 201,
        description: 'Токены успешно обновлены. Новые токены устанавливаются в HttpOnly cookies.',
        type: RefreshResponseDto,
    })
    async refreshTokens(@Request() req, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.refresh_token;
        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token provided');
        }
        this.authService.refreshToken(refreshToken, res);
        return { message: 'Токены успешно обновлены' }
    }

    @Public()
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Выход из системы' })
    async logout(@Res({ passthrough: true }) res: Response) {
        this.authService.clearTokensFromCookie(res);
        return { message: 'Успешный выход' };
    }


    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
    @ApiResponse({
        status: 201,
        type: UserResponseDto,
    })
    async getProfile(@Request() req): Promise<User> {
        return req.user;
    }
}