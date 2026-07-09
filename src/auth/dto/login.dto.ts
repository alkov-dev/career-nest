import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        description: 'Email пользователя',
        example: 'test@example.com',
        required: true,
    })
    @IsEmail()
    email!: string;

    @ApiProperty({
        description: 'Пароль (минимум 6 символов)',
        example: 'secret123',
        minLength: 6,
        required: true,
    })
    @IsString()
    @MinLength(6)
    password!: string;
}