import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CandidateService {
    constructor(private prisma: PrismaService) { }

    async getProfileById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: BigInt(id) },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                // ️ Не возвращаем passwordHash, deletedAt и другие чувствительные поля
            },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // BigInt -> Number для корректной JSON-сериализации
        return {
            ...user,
            id: Number(user.id),
        };
    }
}