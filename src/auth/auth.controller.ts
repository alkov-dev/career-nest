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
    Query,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { LoginDto, LoginResponseDto, RefreshResponseDto, RegisterDto, RegisterResponseDto, UserResponseDto } from '@/shared/dto/auth.dto';
import { User, EmployerProfile, JobHistory } from '@prisma/client';
import { RequestPasswordResetDto } from '@/shared/dto/request-password-reset.dto';
import { ResetPasswordDto } from '@/shared/dto/reset-password.dto';
import { RegisterCompanyDto, RegisterCompanyResponseDto } from '@/shared/dto/register-company.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from '@/minio/minio.service';
import { Mode } from '@/shared/enums/enums';


@ApiTags('Auth')
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private readonly minioService: MinioService,
    ) { }


    @Public()
    @Post('candidate-register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Регистрация (отправляет email)' })
    @ApiResponse({ status: 409, description: 'Email уже занят' })
    @ApiResponse({
        status: 201,
        description: 'Пользователь зарегистрирован. Проверьте email для подтверждения. ',
        type: RegisterResponseDto,
    })
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authService.register(dto);
        this.authService.setTokensInCookie(res, tokens.accessToken, tokens.refreshToken);
        return {
            message: 'Пользователь зарегистрирован. Проверьте email для подтверждения.'
        };
    }

    @Public()
    @Post('company-register')
    @UseInterceptors(
        FileInterceptor('logo', {
            storage: memoryStorage(),
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB
            },
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                    return callback(new Error('Только изображения (JPG, PNG, GIF, WebP)'), false);
                }
                callback(null, true);
            },
        }),
    )
    @ApiOperation({ summary: 'Регистрация новой компании с администратором' })
    @ApiResponse({
        status: 201,
        description: 'Компания и администратор успешно созданы',
        type: RegisterCompanyResponseDto,
    })
    @ApiResponse({
        status: 409,
        description: 'Пользователь с таким email уже зарегистрирован',
    })
    async companyRegistration(
        @Body() dto: RegisterCompanyDto,
        @Res({ passthrough: true }) res: RegisterCompanyResponseDto,
        @UploadedFile() logo?: Express.Multer.File,
    ) {
        let logoUrl = '';

        if (logo) {
            try {
                logoUrl = await this.minioService.uploadFile(logo, 'company-logos');
            } catch (error) {
                throw new Error('Не удалось загрузить логотип');
            }
        }
        dto.logoUrl = logoUrl

        return this.authService.companyRegistration(dto);
    }

    @Public()
    @Get('confirm-email')
    @ApiOperation({ summary: 'Подтверждение email по токену' })
    @ApiQuery({ name: 'token', description: 'Токен подтверждения', example: 'abc123...' })
    @ApiResponse({ status: 200, description: 'Email подтверждён' })
    @ApiResponse({ status: 400, description: 'Недействительный токен' })
    async confirmEmail(@Query('token') token: string) {
        return this.authService.confirmEmail(token);
    }



    @Public()
    @Post('resend-confirmation')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Повторная отправка письма подтверждения' })
    @ApiResponse({ status: 200, description: 'Письмо отправлено' })
    async resendConfirmation(@Body('email') email: string) {
        return this.authService.resendConfirmationEmail(email);
    }




    @Public()
    @Post('request-password-reset')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Запрос на сброс пароля' })
    @ApiBody({ type: RequestPasswordResetDto })
    @ApiResponse({ status: 200, description: 'Письмо отправлено' })
    async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
        return this.authService.requestPasswordReset(dto);
    }



    @Public()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Установить новый пароль' })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({ status: 200, description: 'Пароль изменён' })
    @ApiResponse({ status: 400, description: 'Недействительный токен' })
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
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

        const returnUserData = {
            email: tokens.user.email,
            role: tokens.user.role,
            status: tokens.user.status
        }
        tokens.user = returnUserData as User;

        if (process.env.NODE_ENV !== Mode.PRODUCTION) {
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
        const tokens = await this.authService.refreshToken(refreshToken, res);
        this.authService.setTokensInCookie(res, tokens.accessToken, tokens.refreshToken);
        return { message: 'Токены успешно обновлены' }
    }



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
    async getProfile(@Request() req): Promise<any> {
        return await this.authService.aboutMe(req.user.id);
    }
}