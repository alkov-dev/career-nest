import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobSkillSource, JobSkillType } from '@/shared/enums/enums';

export class JobSkillResponseDto {
    @ApiProperty({ description: 'ID навыка из справочника', example: 42 })
    @Expose()
    skillId!: number;

    @ApiProperty({ description: 'Каноническое название навыка', example: 'React' })
    @Expose()
    name!: string;

    @ApiProperty({
        description: 'Тип навыка: обязательный или желательный',
        enum: JobSkillType,
        example: JobSkillType.REQUIRED
    })
    @Expose()
    type!: JobSkillType;

    @ApiPropertyOptional({
        description: 'Причина добавления навыка',
        example: 'Указано в описании вакансии'
    })
    @Expose()
    reason?: string;

    @ApiPropertyOptional({ description: 'Уверенность ИИ (0.0 - 1.0)', example: 0.95 })
    @Expose()
    confidence?: number | null;

    @ApiPropertyOptional({
        description: 'Источник навыка',
        enum: JobSkillSource,
        example: JobSkillSource.MANUAL
    })
    @Expose()
    source?: JobSkillSource;
}

export class JobPostingResponseDto {
    @ApiProperty({ description: 'Уникальный ID вакансии', example: '1' })
    @Expose()
    id!: string;

    @ApiProperty({ description: 'ID компании работодателя', example: '1' })
    @Expose({ name: 'companyId' }) // Маппинг из БД (если в БД поле называется companyId)
    companyId!: string;

    @ApiProperty({ description: 'Название вакансии', example: 'Frontend Developer (React)' })
    @Expose()
    title!: string;

    @ApiPropertyOptional({ description: 'Департамент или отдел', example: 'Engineering' })
    @Expose()
    department?: string | null;

    @ApiPropertyOptional({ description: 'Город или локация', example: 'Москва' })
    @Expose()
    location?: string | null;

    @ApiPropertyOptional({
        description: 'Формат работы',
        enum: ['remote', 'hybrid', 'onsite'],
        example: 'hybrid'
    })
    @Expose()
    remoteOption?: 'remote' | 'hybrid' | 'onsite' | null;

    @ApiProperty({
        description: 'Диапазон заработной платы',
        type: 'object',
        properties: {
            min: { type: 'number', example: 100000 },
            max: { type: 'number', example: 250000 },
            currency: { type: 'string', example: 'RUB' }
        }
    })
    @Expose()
    get salaryRange() {
        return {
            min: this.salaryMin ?? 0,
            max: this.salaryMax ?? 0,
            currency: this.currency ?? 'RUB',
        };
    }

    salaryMin?: number | null;
    salaryMax?: number | null;
    currency?: string | null;

    @ApiPropertyOptional({ description: 'Полное описание вакансии' })
    @Expose()
    description?: string | null;

    @ApiProperty({
        description: 'Список обязательных требований',
        type: [String],
        example: ['3+ года коммерческого опыта', 'Отличное знание TypeScript']
    })
    @Expose()
    requirements!: string[];

    @ApiProperty({
        description: 'Список рабочих обязанностей',
        type: [String],
        example: ['Разработка новых фич', 'Проведение code review']
    })
    @Expose()
    responsibilities!: string[];

    @ApiProperty({
        description: 'Список желательных навыков (будет плюсом)',
        type: [String],
        example: ['Опыт работы с GraphQL', 'Знание Docker']
    })
    @Expose()
    niceToHave!: string[];

    @ApiProperty({
        description: 'Плоский список названий навыков (для быстрого отображения)',
        type: [String],
        example: ['React', 'Redux', 'TypeScript']
    })
    @Expose()
    skills!: string[];

    @ApiPropertyOptional({
        description: 'Требуемый уровень опыта',
        enum: ['entry', 'junior', 'middle', 'senior', 'lead', 'executive'],
        example: 'middle'
    })
    @Expose()
    experienceLevel?: string | null;

    @ApiPropertyOptional({
        description: 'Тип занятости',
        enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
        example: 'full-time'
    })
    @Expose()
    employmentType?: string | null;

    @ApiProperty({
        description: 'Соцпакет и льготы',
        type: [String],
        example: ['ДМС со стоматологией', 'Гибкий график', 'Офис в центре']
    })
    @Expose()
    benefits!: string[];

    @ApiProperty({
        description: 'Текущий статус вакансии',
        enum: ['draft', 'active', 'paused', 'closed'],
        example: 'active'
    })
    @Expose()
    status!: 'draft' | 'active' | 'paused' | 'closed';

    @ApiProperty({ description: 'Количество полученных откликов', example: 0 })
    @Expose()
    applicantCount!: number;

    @ApiProperty({ description: 'Количество кандидатов, подобранных ИИ', example: 0 })
    @Expose()
    aiMatchCount!: number;

    @ApiProperty({ description: 'Дата и время создания', format: 'date-time' })
    @Expose()
    createdAt!: string;

    @ApiProperty({ description: 'Дата и время последнего обновления', format: 'date-time' })
    @Expose()
    updatedAt!: string;

    @ApiProperty({
        description: 'Детализированный список навыков с метаданными',
        type: () => [JobSkillResponseDto] // Стрелочная функция обязательна для избежания циклических зависимостей
    })
    @Expose()
    @Type(() => JobSkillResponseDto)
    jobSkills!: JobSkillResponseDto[];
}