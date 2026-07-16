import {
    IsString, IsOptional, IsNumber, IsIn, IsArray,
    ValidateNested, Min
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateJobSkillDto } from './create-job-skill.dto';

class SalaryRangeDto {
    @IsNumber()
    @Min(0)
    min!: number;

    @IsNumber()
    @Min(0)
    max!: number;

    @IsString()
    currency!: string;
}

export class CreateJobDto {
    @IsString()
    companyId!: string; // Придет с фронта, на бэке проверим принадлежность пользователю

    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    department?: string;

    @IsString()
    location!: string;

    @IsIn(['remote', 'hybrid', 'onsite'])
    remoteOption!: 'remote' | 'hybrid' | 'onsite';

    @ValidateNested()
    @Type(() => SalaryRangeDto)
    salaryRange!: SalaryRangeDto;

    @IsString()
    description!: string;

    @IsArray()
    @IsString({ each: true })
    requirements!: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    responsibilities?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    niceToHave?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    skills?: string[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateJobSkillDto)
    jobSkills?: CreateJobSkillDto[];

    @IsString()
    experienceLevel!: string;

    @IsString()
    employmentType!: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    benefits?: string[];

    @IsIn(['draft', 'active', 'paused', 'closed'])
    status!: 'draft' | 'active' | 'paused' | 'closed';

    @IsOptional()
    @IsNumber()
    @Min(0)
    applicantCount?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    aiMatchCount?: number;
}