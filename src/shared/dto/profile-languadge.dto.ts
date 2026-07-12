import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProfileLanguageResponseDto {
    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата создания' })
    @Expose()
    createdAt?: Date | null;

    @ApiProperty({ example: 1, description: 'ID профиля кандидата' })
    @Expose()
    profileId?: bigint;

    @ApiPropertyOptional({ example: 'fluent', description: 'Уровень владения языком' })
    @Expose()
    level?: string | null;

    @ApiProperty({ example: 1, description: 'ID языка' })
    @Expose()
    languageId?: bigint;
}