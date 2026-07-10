import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { User, CandidateProfile, CandidateSkill, Application, CvUpload, CvAnalysis } from '@prisma/client';

export class UserResponseDto {
    @ApiProperty({ type: UserResponseDto, description: 'Данные пользователя' })

    @ApiProperty({ example: 1, description: 'ID пользователя' })
    id!: bigint;

    @ApiProperty({ example: 'test@example.com', description: 'Email' })
    email!: string;

    @ApiProperty({ example: 'candidate', description: 'Роль пользователя' })
    role!: string;

    @ApiProperty({ example: 'active', description: 'Статус пользователя' })
    status?: string | null;

    @ApiProperty({ example: new Date(), description: 'Дата создания пользователя' })
    createdAt!: Date;

    @ApiProperty({ example: new Date(), description: 'Дата обновления пользователя' })
    updatedAt?: Date | null;
}

export class LoginResponseDto {
    user!: UserResponseDto;

    @ApiPropertyOptional({
        description: 'JWT Access Token (только в development)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    accessToken?: string;
}

export class RefreshResponseDto {
    @ApiPropertyOptional({
        description: 'Токены успешно обновлены',
        example: 'Токены успешно обновлены',
    })
    message!: string;
}

export class RegisterResponseDto {
    @ApiPropertyOptional({
        description: 'Пользователь успешно зарегистрирован',
        example: 'Пользователь успешно зарегистрирован',
    })
    message!: string;
}



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