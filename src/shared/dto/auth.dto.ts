import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { JobHistory, Message, Notification } from '@prisma/client';
import { CandidateResponseDto } from './candidate-profile.dto';
import { Expose, Type } from 'class-transformer';
import { CoverLetterResponseDto } from './cover-letter.dto';
import { CvUploadResponseDto } from './cv-upload.dto';
import { JobHistoryResponseDto } from './job-history.dto';
import { MessageResponseDto } from './message.dto';
import { NotificationResponseDto } from './notification.dto';
import { EmployerProfileResponseDto } from './emloyer-profile.dto';
import { UserRole } from '../enums/enums';

export class UserResponseDto {
    @ApiProperty({ type: UserResponseDto, description: 'Данные пользователя' })

    @ApiProperty({ example: 1, description: 'ID пользователя' })
    id!: bigint;

    @ApiProperty({ example: 'test@example.com', description: 'Email' })
    email!: string;

    @ApiProperty({ example: 'candidate', description: 'Роль пользователя' })
    role!: string;

    @ApiPropertyOptional({
        example: '2026-07-11T16:00:00.000Z', description: 'Срок действия токена подтверждения'
    })
    emailConfirmExpires?: Date | null;

    @ApiPropertyOptional({
        example: '2026-07-11T16:00:00.000Z', description: 'Срок действия токена смены пароля'
    })
    passwordResetExpires?: Date | null;

    @ApiPropertyOptional({ example: 'active', description: 'Статус пользователя' })
    status?: string | null;

    @ApiProperty({ example: new Date(), description: 'Дата создания пользователя' })
    createdAt!: Date;

    @ApiPropertyOptional({ example: new Date(), description: 'Дата обновления пользователя' })
    updatedAt?: Date | null;

    @ApiPropertyOptional({ type: () => [CandidateResponseDto] })
    @Type(() => CandidateResponseDto)
    @Expose()
    candidateProfile?: CandidateResponseDto[];

    @ApiPropertyOptional({ type: () => [EmployerProfileResponseDto] })
    @Type(() => EmployerProfileResponseDto)
    @Expose()
    employerProfile?: EmployerProfileResponseDto[];

    @ApiPropertyOptional({ type: () => [CoverLetterResponseDto] })
    @Type(() => CoverLetterResponseDto)
    @Expose()
    coverLetters?: CoverLetterResponseDto[];

    @ApiPropertyOptional({ type: () => [CvUploadResponseDto] })
    @Type(() => CvUploadResponseDto)
    @Expose()
    cvUploads?: CvUploadResponseDto[];

    @ApiPropertyOptional({ type: () => [JobHistoryResponseDto] })
    @Type(() => JobHistoryResponseDto)
    @Expose()
    jobHistory?: JobHistoryResponseDto[];

    @ApiPropertyOptional({ type: () => [MessageResponseDto] })
    @Type(() => MessageResponseDto)
    @Expose()
    receivedMessages?: MessageResponseDto[];

    @ApiPropertyOptional({ type: () => [MessageResponseDto] })
    @Type(() => MessageResponseDto)
    @Expose()
    sentMessages?: MessageResponseDto[];

    @ApiPropertyOptional({ type: () => [NotificationResponseDto] })
    @Type(() => NotificationResponseDto)
    @Expose()
    notifications?: NotificationResponseDto[];
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
        example: 'candidate, employer',
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