import {
    Injectable,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(private prisma: PrismaService) { }

    async register(dto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Пользователь с таким email уже существует');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                role: dto.role,
                status: 'active',
            },
        });

        this.logger.log(`✅ Создан пользователь: ${user.email} (id: ${user.id})`);

        return {
            id: user.id,
            email: user.email,
            role: user.role,
            status: 'active',
        };
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });
    }
}