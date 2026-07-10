import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class SkillResponseDto {
    @ApiProperty({ example: 1, description: 'ID профиля' })
    @Expose()
    profileId!: bigint;

    @ApiPropertyOptional({ example: '2026-07-09T10:00:00.000Z', description: 'Дата обновления' })
    @Expose()
    updatedAt?: Date | null;

    @ApiPropertyOptional({ example: '2026-07-09T10:00:00.000Z', description: 'Дата создания' })
    @Expose()
    createdAt?: Date | null;

    @ApiProperty({ example: 1, description: 'ID навыка' })
    @Expose()
    skillId!: bigint;

    @ApiPropertyOptional({ example: 'expert', description: 'Уровень владения', enum: ['beginner', 'intermediate', 'expert'] })
    @Expose()
    level?: string | null;

    @ApiPropertyOptional({ example: 5, description: 'Лет опыта' })
    @Expose()
    years?: number | null;
}