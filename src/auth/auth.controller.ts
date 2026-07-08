import {
    Controller,
    Post,
    Get,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    /**
     * POST /auth/register
     * Регистрация нового пользователя
     */
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    /**
     * GET /auth/users
     * Список пользователей (позже добавим RolesGuard)
     */
    @Get('users')
    async findAll() {
        return this.authService.findAll();
    }
}