import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    IsOptional,
    IsUrl,
    IsInt,
    Min,
    IsNotEmpty,
    IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../enums/enums';

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

    @ApiPropertyOptional({
        description: 'Логотип компании (файл изображения)',
        type: 'string',
        format: 'binary',
    })
    @IsOptional()
    logo?: any;

    @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
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

    @ApiPropertyOptional({ example: '50-100' })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    employeeCount?: string;

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

export class CreateHrUserDto {
    @ApiProperty({
        example: 'hr_manager@company.com',
        description: 'Корпоративный email нового сотрудника',
    })
    @IsEmail({}, { message: 'Некорректный формат email' })
    @IsNotEmpty({ message: 'Email обязателен для заполнения' })
    email!: string;

    @ApiProperty({
        example: 'Иван',
        description: 'Имя сотрудника',
    })
    @IsString({ message: 'Имя должно быть строкой' })
    @IsNotEmpty({ message: 'Имя обязательно для заполнения' })
    firstName!: string;

    @ApiProperty({
        example: 'Иванов',
        description: 'Фамилия сотрудника',
    })
    @IsString({ message: 'Фамилия должна быть строкой' })
    @IsNotEmpty({ message: 'Фамилия обязательна для заполнения' })
    lastName!: string;

    @ApiProperty({
        example: '1234567890123',
        description: 'ID компании. Передается как строка, так как в Prisma используется тип BigInt',
    })
    @IsString({ message: 'ID компании должен быть строкой' })
    @IsNotEmpty({ message: 'ID компании обязателен для заполнения' })
    companyId!: string;
}