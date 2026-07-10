
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { UserResponseDto } from './auth.dto';
import { Expose } from 'class-transformer';


export class EmployerProfileResponseDto {
    @ApiProperty({ example: 1, description: 'ID профиля работодателя' })
    @Expose()
    id!: bigint;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата создания' })
    @Expose()
    createdAt?: Date | null;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата обновления' })
    @Expose()
    updatedAt?: Date | null;

    @ApiProperty({ example: 1, description: 'ID пользователя' })
    @Expose()
    userId!: bigint;

    @ApiPropertyOptional({ example: 1, description: 'ID компании' })
    @Expose()
    companyId?: bigint | null;

    @ApiPropertyOptional({ example: 'CTO', description: 'Должность в компании' })
    @Expose()
    positionInCompany?: string | null;
}

export class UpdateEmployerDto {
    @ApiPropertyOptional({ example: 5, description: 'ID компании' })
    @IsOptional()
    @IsNumber()
    companyId?: BigInt;

    @ApiPropertyOptional({ example: 'HR Manager', description: 'Должность в компании' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    positionInCompany?: string;
}
