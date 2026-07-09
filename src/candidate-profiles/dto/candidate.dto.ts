import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CandidateResponseDto {
    @ApiProperty({ example: 1, description: 'ID' })
    id!: number;

    @ApiProperty({ example: 1, description: 'ID пользователя' })
    userId!: number;

    @ApiPropertyOptional({ example: 'Иван Иванов', description: 'ФИО' })
    fullName?: string | null;

    @ApiPropertyOptional({ example: 'Москва', description: 'Город' })
    city?: string | null;

    @ApiPropertyOptional({ example: 'Москва', description: 'Город (канонический)' })
    cityCanonical?: string | null;

    @ApiPropertyOptional({ example: 'Разработчик', description: 'О себе' })
    summary?: string | null;

    @ApiPropertyOptional({ example: 100000, description: 'Мин. зарплата' })
    salaryMin?: number | null;

    @ApiPropertyOptional({ example: 150000, description: 'Макс. зарплата' })
    salaryMax?: number | null;

    @ApiPropertyOptional({ example: 'RUB', description: 'Валюта' })
    currency?: string | null;

    @ApiPropertyOptional({ example: true, description: 'Удаленка' })
    remoteOk?: boolean | null;

    @ApiPropertyOptional({ example: true, description: 'Готовность к переезду' })
    willingToRelocate?: boolean | null;

    @ApiPropertyOptional({ example: 3.5, description: 'Общий опыт (лет)' })
    totalExperienceYears?: number | null;

    @ApiPropertyOptional({ example: 'https://example.com/cv.pdf', description: 'URL CV' })
    originalCvUrl?: string | null;

    @ApiPropertyOptional({ example: true, description: 'Активен' })
    isActive?: boolean | null;

    @ApiPropertyOptional({ example: 1, description: 'ID загрузки CV' })
    cvUploadId?: number | null;

    @ApiPropertyOptional({
        example: '2026-01-01T00:00:00.000Z',
        description: 'Дата обновления',
        type: String,
    })
    updatedAt?: Date | null;

    @ApiPropertyOptional({
        example: null,
        description: 'Дата удаления',
        type: String,
    })
    deletedAt?: Date | null;
}