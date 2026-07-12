import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    IsOptional,
    IsUrl,
    IsInt,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterCompanyDto {
    // === Администратор компании ===
    @ApiProperty({ example: 'admin@company.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'StrongPass123!' })
    @IsString()
    @MinLength(8)
    password!: string;

    @ApiProperty({ example: 'Иван' })
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    firstName!: string;

    @ApiPropertyOptional({ example: 'Петров' })
    @IsString()
    @IsOptional()
    @MinLength(1)
    @MaxLength(100)
    lastName!: string;

    @ApiProperty({ example: 'CEO' })
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    positionInCompany!: string;

    // === Компания ===
    @ApiProperty({ example: 'ООО Рога и Копыта' })
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    companyName!: string;

    @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
    @IsOptional()
    @IsUrl()
    logoUrl?: string;

    @ApiPropertyOptional({ example: 'https://example.com' })
    @IsOptional()
    @IsUrl()
    website?: string;

    @ApiPropertyOptional({ example: 'IT' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    industry?: string;

    @ApiPropertyOptional({ example: '50-100' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    size?: string;

    @ApiPropertyOptional({ example: 75 })
    @IsOptional()
    @IsInt()
    @Min(1)
    employeeCount?: number;

    @ApiPropertyOptional({ example: 'Москва' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    headOffice?: string;

    @ApiPropertyOptional({ example: 'https://linkedin.com/company/example' })
    @IsOptional()
    @IsUrl()
    linkedin?: string;

    @ApiPropertyOptional({ example: 'Разработка ПО' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 'Инновации, качество' })
    @IsOptional()
    @IsString()
    corporateCulture?: string;

    @ApiPropertyOptional({ example: 'Инновации, качество' })
    @IsOptional()
    @IsString()
    values?: string;

    @ApiPropertyOptional({ example: 'ДМС, гибкий график' })
    @IsOptional()
    @IsString()
    benefits?: string;
}


export class RegisterCompanyResponseDto {
    @ApiProperty()
    userId!: string;

    @ApiProperty()
    companyId!: string;

    @ApiProperty()
    email!: string;

    @ApiProperty()
    message!: string;
}