import { IsString, IsOptional, IsNumber, IsIn, Min, Max } from 'class-validator';

export class CreateJobSkillDto {
    @IsOptional()
    @IsNumber()
    skillId?: number;

    @IsString()
    name!: string;

    @IsIn(['required', 'nice_to_have'])
    type!: 'required' | 'nice_to_have';

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    confidence?: number;

    @IsOptional()
    @IsIn(['manual', 'ai_suggested', 'ai_accepted'])
    source?: 'manual' | 'ai_suggested' | 'ai_accepted';
}