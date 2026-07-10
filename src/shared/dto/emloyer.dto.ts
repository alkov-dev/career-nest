
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { UserResponseDto } from './auth.dto';


export class EmployerResponseDto {
    @ApiProperty({ example: 1, description: 'ID профиля' })
    id!: BigInt;

    @ApiProperty({ example: 3, description: 'ID пользователя' })
    userId!: BigInt;

    @ApiPropertyOptional({ example: 5, description: 'ID компании' })
    companyId?: BigInt | null;

    @ApiPropertyOptional({ example: 'HR Manager', description: 'Должность в компании' })
    positionInCompany?: string | null;

    @ApiProperty({
        example: '2026-07-09T06:44:10.707Z',
        description: 'Дата создания',
        type: String,
    })
    createdAt!: Date;

    @ApiProperty({
        example: '2026-07-09T15:24:52.776Z',
        description: 'Дата обновления',
        type: String,
    })
    updatedAt!: Date;

    @ApiProperty({
        type: UserResponseDto,
        description: 'Данные пользователя'
    })
    user!: UserResponseDto;
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
