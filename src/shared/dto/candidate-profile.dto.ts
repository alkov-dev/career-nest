
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { SkillResponseDto } from '@/shared/dto/candidate-skill.dto';
import { UserResponseDto } from './auth.dto';
import { ApplicationResponseDto } from './application.dto';
import { CvUploadResponseDto } from './cvupload.dto';
import { CvAnalysesResponseDto } from './cvanalyses.dto';



export class CandidateResponseDto {
    @ApiProperty({ example: 1, description: 'ID' })
    id!: BigInt;

    @ApiProperty({ example: 1, description: 'ID пользователя' })
    userId!: BigInt;

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
    cvUploadId?: BigInt | null;

    @ApiPropertyOptional({
        example: '2026-01-01T00:00:00.000Z',
        description: 'Дата обновления',
        type: String,
    })
    updatedAt?: Date | null;

    @ApiProperty({
        type: UserResponseDto,
        description: 'Данные пользователя'
    })
    user!: UserResponseDto;

    @ApiProperty({
        type: CvUploadResponseDto,
        description: 'Данные при загрузке файла'
    })
    cvUpload!: CvUploadResponseDto;

    @ApiProperty({ type: [SkillResponseDto] })
    @Type(() => SkillResponseDto)
    @Expose()
    skills!: SkillResponseDto[];

    @ApiProperty({ type: [ApplicationResponseDto] })
    @Type(() => ApplicationResponseDto)
    @Expose()
    applications!: ApplicationResponseDto[];

    @ApiProperty({ type: [CvAnalysesResponseDto] })
    @Type(() => CvAnalysesResponseDto)
    @Expose()
    cvAnalyses!: CvAnalysesResponseDto[];

}

export class UpdateCandidateDto {
    @ApiPropertyOptional({ example: 'Иван Иванов', description: 'ФИО' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    fullName?: string;

    @ApiPropertyOptional({ example: 'Москва', description: 'Город' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    city?: string;

    @ApiPropertyOptional({ example: 'Москва', description: 'Город (канонический)' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    cityCanonical?: string;

    @ApiPropertyOptional({ example: 'Backend разработчик с опытом 5 лет', description: 'О себе' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    summary?: string;

    @ApiPropertyOptional({ example: 150000, description: 'Минимальная зарплата' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    salaryMin?: number;

    @ApiPropertyOptional({ example: 250000, description: 'Максимальная зарплата' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    salaryMax?: number;

    @ApiPropertyOptional({ example: 'RUB', description: 'Валюта' })
    @IsOptional()
    @IsString()
    currency?: string;

    @ApiPropertyOptional({ example: true, description: 'Готовность к удалённой работе' })
    @IsOptional()
    @IsBoolean()
    remoteOk?: boolean;

    @ApiPropertyOptional({ example: true, description: 'Готовность к переезду' })
    @IsOptional()
    @IsBoolean()
    willingToRelocate?: boolean;

    @ApiPropertyOptional({ example: 5.5, description: 'Общий опыт (лет)' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(50)
    totalExperienceYears?: number;

}
