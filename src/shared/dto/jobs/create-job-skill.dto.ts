import { IsString, IsOptional, IsNumber, IsIn, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobSkillSource, JobSkillType } from '@/shared/enums/enums';

export class CreateJobSkillDto {
    @ApiPropertyOptional({
        description: 'ID существующего навыка из справочника. Если не указан, навык будет найден или создан по названию',
        example: 42,
    })
    @IsOptional()
    @IsNumber()
    skillId?: number;

    @ApiProperty({
        description: 'Название навыка (например, "React", "TypeScript")',
        example: 'React',
    })
    @IsString()
    name!: string;

    @IsEnum(JobSkillType)
    @ApiProperty({
        description: 'Тип навыка: обязательный или желательный',
        enum: JobSkillType,
        example: JobSkillType.REQUIRED,
    })
    type!: JobSkillType;

    @ApiPropertyOptional({
        description: 'Причина добавления навыка (например, откуда он был извлечен)',
        example: 'Упомянуто в описании вакансии',
    })
    @IsOptional()
    @IsString()
    reason?: string;

    @ApiPropertyOptional({
        description: 'Уверенность ИИ в том, что этот навык нужен для вакансии (от 0.0 до 1.0)',
        example: 0.95,
        minimum: 0,
        maximum: 1,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    confidence?: number;

    @ApiPropertyOptional({
        description: 'Источник навыка: добавлен вручную, предложен ИИ или подтвержден после предложения ИИ',
        enum: JobSkillSource,
        example: JobSkillSource.MANUAL,
        default: JobSkillSource.MANUAL,
    })
    @IsOptional()
    source?: JobSkillSource;
}