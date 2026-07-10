// src/cv-uploads/dto/cv-upload-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CvUploadResponseDto {
    @ApiProperty({ example: 1, description: 'ID загрузки' })
    @Expose()
    id!: bigint;

    @ApiPropertyOptional({ example: 'pending', description: 'Статус обработки' })
    @Expose()
    status?: string | null;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата создания' })
    @Expose()
    createdAt?: Date | null;

    @ApiProperty({ example: 1, description: 'ID пользователя' })
    @Expose()
    userId!: bigint;

    @ApiProperty({ example: 'https://example.com/resume.pdf', description: 'Ссылка на файл' })
    @Expose()
    originalUrl!: string;

    @ApiPropertyOptional({ example: 'application/pdf', description: 'MIME тип файла' })
    @Expose()
    mimeType?: string | null;

    @ApiPropertyOptional({ example: 1024, description: 'Размер файла в байтах' })
    @Expose()
    sizeBytes?: bigint | null;

    @ApiPropertyOptional({ example: 'Текст резюме...', description: 'Извлечённый текст' })
    @Expose()
    extractedText?: string | null;

    @ApiPropertyOptional({ description: 'Распарсенные данные из резюме' })
    @Expose()
    parsedJson: any;

    @ApiPropertyOptional({ example: 0.95, description: 'Уверенность парсинга (0-1)' })
    @Expose()
    confidence?: number | null;

    @ApiPropertyOptional({ example: 'Ошибка парсинга', description: 'Сообщение об ошибке' })
    @Expose()
    errorMessage?: string | null;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата парсинга' })
    @Expose()
    parsedAt?: Date | null;

    @ApiPropertyOptional({ example: '2026-08-10T10:00:00.000Z', description: 'Дата истечения' })
    @Expose()
    expiresAt?: Date | null;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата проверки' })
    @Expose()
    reviewedAt?: Date | null;
}