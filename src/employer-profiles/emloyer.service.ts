import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateEmployerDto } from '../shared/dto/emloyer.dto';

@Injectable()
export class EmployerService {
    constructor(private prisma: PrismaService) { }

    async getProfileById(id: string) {
        const profile = await this.prisma.employerProfile.findUnique({
            where: { id: BigInt(id) },
            select: {
                id: true,
                userId: true,
                companyId: true,
                positionInCompany: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        status: true,
                    },
                },
            }
        });

        if (!profile) {
            throw new NotFoundException(`Employer with ID ${id} not found`);
        }

        return profile
    }

    async findAll() {
        const employers = await this.prisma.employerProfile.findMany({
            select: {
                id: true,
                userId: true,
                companyId: true,
                positionInCompany: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return employers
    }

    async update(id: string, dto: UpdateEmployerDto, currentUserId: number) {
        const profile = await this.prisma.employerProfile.findUnique({
            where: { id: BigInt(id) },
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

        const updatedProfile = await this.prisma.employerProfile.update({
            where: { id: BigInt(id) },
            data: cleanData,
            select: {
                id: true,
                userId: true,
                companyId: true,
                positionInCompany: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        status: true,
                    },
                },
            },
        });

        return updatedProfile
    }
}