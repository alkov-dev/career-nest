import { IsString, IsOptional, IsNumber, IsIn, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

    @ApiProperty({
        description: 'Тип навыка: обязательный или желательный',
        enum: ['required', 'nice_to_have'],
        example: 'required',
    })
    @IsIn(['required', 'nice_to_have'])
    type!: 'required' | 'nice_to_have';

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
        enum: ['manual', 'ai_suggested', 'ai_accepted'],
        example: 'manual',
        default: 'manual',
    })
    @IsOptional()
    @IsIn(['manual', 'ai_suggested', 'ai_accepted'])
    source?: 'manual' | 'ai_suggested' | 'ai_accepted';
}