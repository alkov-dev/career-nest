import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
    @ApiProperty({ description: 'Токен сброса пароля', example: 'abc123...' })
    @IsString()
    token!: string;

    @ApiProperty({ example: 'newPassword123', description: 'Новый пароль (мин. 6 символов)', minLength: 6 })
    @IsString()
    @MinLength(6)
    @MaxLength(100)
    password!: string;
}