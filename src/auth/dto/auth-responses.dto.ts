import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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