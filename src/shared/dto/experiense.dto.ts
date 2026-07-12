import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ExperienceResponseDto {
    @ApiPropertyOptional({ example: 'Разработка веб-приложений...', description: 'Описание опыта' })
    @Expose()
    description?: string | null;

    @ApiProperty({ example: 1, description: 'ID записи опыта' })
    @Expose()
    id!: bigint;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата создания' })
    @Expose()
    createdAt?: Date | null;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата обновления' })
    @Expose()
    updatedAt?: Date | null;

    @ApiProperty({ example: 1, description: 'ID профиля кандидата' })
    @Expose()
    profileId!: bigint;

    @ApiProperty({ example: 'ООО Ромашка', description: 'Название компании' })
    @Expose()
    company!: string;

    @ApiProperty({ example: 'Fullstack Developer', description: 'Должность' })
    @Expose()
    position!: string;

    @ApiPropertyOptional({ example: '2020-01-01T00:00:00.000Z', description: 'Дата начала работы' })
    @Expose()
    startDate?: Date | null;

    @ApiPropertyOptional({ example: '2023-12-31T00:00:00.000Z', description: 'Дата окончания работы' })
    @Expose()
    endDate?: Date | null;

    @ApiPropertyOptional({ example: true, description: 'Текущее место работы' })
    @Expose()
    current?: boolean | null;

    @ApiPropertyOptional({ description: 'Используемые технологии' })
    @Expose()
    technologies: any;

    @ApiPropertyOptional({ example: 1, description: 'Порядок сортировки' })
    @Expose()
    sortOrders?: number | null;
}