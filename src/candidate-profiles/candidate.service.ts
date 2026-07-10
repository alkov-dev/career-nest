import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCandidateDto } from '@/shared/dto/candidate-profile.dto';
import { candidateSelect } from '@/shared/constants/selects';



@Injectable()
export class CandidateService {
    constructor(private prisma: PrismaService) { }

    async getProfileById(id: string) {
        const profile = await this.prisma.candidateProfile.findUnique({
            where: { id: BigInt(id) },
            select: candidateSelect,
        });

        if (!profile) {
            throw new NotFoundException(`Candidate with ID ${id} not found`);
        }

        return profile
    }

    async findAll() {
        const candidates = await this.prisma.candidateProfile.findMany({
            where: {
                deletedAt: null,
            },
            select: candidateSelect,
            orderBy: {
                createdAt: 'desc',
            },
        });


        return candidates;
    }

    async update(id: string, dto: UpdateCandidateDto, currentUserId: number) {
        const profile = await this.prisma.candidateProfile.findUnique({
            where: { id: BigInt(id), deletedAt: null },
        });

        if (!profile) {
            throw new NotFoundException(`Профиль с ID ${id} не найден`);
        }

        if (Number(profile.userId) !== currentUserId) {
            throw new ForbiddenException('У вас нет прав на редактирование этого профиля');
        }

        const cleanData = Object.fromEntries(
            Object.entries(dto).filter(([_, value]) => value !== undefined)
        );

        if (Object.keys(cleanData).length === 0) {
            throw new BadRequestException('Нет данных для обновления');
        }

        const updatedProfile = await this.prisma.candidateProfile.update({
            where: { id: BigInt(id) },
            data: cleanData,
            select: candidateSelect,
        });

        return updatedProfile
    }
}