import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export enum UserRole {
    CANDIDATE = 'candidate',
    EMPLOYER = 'employer',
}

export class RegisterDto {
    @ApiProperty({
        description: 'Email пользователя',
        example: 'test@example.com',
        required: true,
    })
    @IsEmail()
    email!: string;

    @ApiProperty({
        description: 'Пароль пользователя',
        example: 'password123',
        required: true,
    })
    @IsString()
    @MinLength(8)
    @MaxLength(50)
    password!: string;

    @ApiProperty({
        description: 'Полное имя пользователя',
        example: 'Иван Иванов',
        required: true,
    })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    fullName!: string;

    @ApiProperty({
        description: 'Роль пользователя',
        example: 'candidate',
        required: false,
    })
    @IsOptional()
    @IsString()
    role?: UserRole;

    @ApiProperty({
        description: 'Город пользователя',
        example: 'Москва',
        required: false,
    })
    @IsOptional()
    @IsString()
    city?: string;
}