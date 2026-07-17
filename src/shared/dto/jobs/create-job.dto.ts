import {
    IsString, IsOptional, IsNumber, IsIn, IsArray,
    ValidateNested, Min
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateJobSkillDto } from './create-job-skill.dto';

class SalaryRangeDto {
    @ApiProperty({ description: 'Минимальная зарплата', example: 100000, minimum: 0 })
    @IsNumber()
    @Min(0)
    min!: number;

    @ApiProperty({ description: 'Максимальная зарплата', example: 250000, minimum: 0 })
    @IsNumber()
    @Min(0)
    max!: number;

    @ApiProperty({ description: 'Валюта', example: 'RUB', enum: ['RUB', 'USD', 'EUR', 'KZT'] })
    @IsString()
    currency!: string;
}

export class CreateJobDto {
    @ApiProperty({ description: 'Название вакансии', example: 'Frontend Developer (React)' })
    @IsString()
    title!: string;

    @ApiPropertyOptional({ description: 'Отдел или департамент', example: 'Engineering' })
    @IsOptional()
    @IsString()
    department?: string;

    @ApiProperty({ description: 'Город или локация', example: 'Москва' })
    @IsString()
    location!: string;

    @ApiProperty({
        description: 'Формат работы',
        enum: ['remote', 'hybrid', 'onsite'],
        example: 'hybrid'
    })
    @IsIn(['remote', 'hybrid', 'onsite'])
    remoteOption!: 'remote' | 'hybrid' | 'onsite';

    @ApiProperty({
        description: 'Диапазон заработной платы',
        type: () => SalaryRangeDto
    })
    @ValidateNested()
    @Type(() => SalaryRangeDto)
    salaryRange!: SalaryRangeDto;

    @ApiProperty({
        description: 'Полное описание вакансии',
        example: 'Мы ищем талантливого разработчика для создания инновационных продуктов...'
    })
    @IsString()
    description!: string;

    @ApiProperty({
        description: 'Список обязательных требований',
        type: [String],
        example: ['Опыт коммерческой разработки от 3 лет', 'Отличное знание JavaScript/TypeScript']
    })
    @IsArray()
    @IsString({ each: true })
    requirements!: string[];

    @ApiPropertyOptional({
        description: 'Список обязанностей',
        type: [String],
        example: ['Разработка новых фич', 'Проведение code review', 'Менторство джуниоров']
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    responsibilities?: string[];

    @ApiPropertyOptional({
        description: 'Список желательных навыков (будет плюсом)',
        type: [String],
        example: ['Опыт работы с GraphQL', 'Знание Docker']
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    niceToHave?: string[];

    @ApiPropertyOptional({
        description: 'Денормализованный плоский список названий навыков (для быстрого отображения)',
        type: [String],
        example: ['React', 'TypeScript', 'Redux']
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    skills?: string[];

    @ApiPropertyOptional({
        description: 'Детализированный список навыков с метаданными (важность, источник, уверенность ИИ)',
        type: () => [CreateJobSkillDto]
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateJobSkillDto)
    jobSkills?: CreateJobSkillDto[];

    @ApiProperty({
        description: 'Уровень опыта',
        enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'],
        example: 'mid'
    })
    @IsString()
    experienceLevel!: string;

    @ApiProperty({
        description: 'Тип занятости',
        enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
        example: 'full-time'
    })
    @IsString()
    employmentType!: string;

    @ApiPropertyOptional({
        description: 'Соцпакет и льготы',
        type: [String],
        example: ['ДМС со стоматологией', 'Офис в центре', 'Гибкий график']
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    benefits?: string[];

    @ApiProperty({
        description: 'Статус вакансии',
        enum: ['draft', 'active', 'paused', 'closed'],
        example: 'draft'
    })
    @IsIn(['draft', 'active', 'paused', 'closed'])
    status!: 'draft' | 'active' | 'paused' | 'closed';

    @ApiPropertyOptional({
        description: 'Количество откликов (обычно 0 при создании)',
        example: 0,
        minimum: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    applicantCount?: number;

    @ApiPropertyOptional({
        description: 'Количество кандидатов, подобранных ИИ (обычно 0 при создании)',
        example: 0,
        minimum: 0
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    aiMatchCount?: number;
}