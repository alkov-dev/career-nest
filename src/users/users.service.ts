import { EmailService } from '@/email/email.service';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateHrUserDto } from '@/shared/dto/register-company.dto';
import { UserRole, UserStatus } from '@/shared/enums/enums';
import { parseBigInt } from '@/shared/utils/parse';
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';


@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
    ) { }


    async createHrUser(dto: CreateHrUserDto, adminId: bigint) {
        const companyIdBigInt = parseBigInt(dto.companyId, 'companyId');

        const company = await this.prisma.company.findUnique({
            where: { id: companyIdBigInt },
        });

        if (!company) {
            throw new NotFoundException(`Компания с ID ${dto.companyId} не найдена в системе`);
        }

        const admin = await this.prisma.user.findUnique({
            where: { id: adminId },
        });

        if (!admin) {
            throw new ForbiddenException('Администратор не найден');
        }

        if (admin.status !== UserStatus.ACTIVE) {
            throw new ForbiddenException('Ваш аккаунт неактивен');
        }

        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Пользователь с таким email уже существует');
        }

        const tempPassword = crypto.randomUUID().slice(0, 8);
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        const inviteToken = crypto.randomUUID();
        const inviteExpires = new Date();
        inviteExpires.setDate(inviteExpires.getDate() + 7);

        return this.prisma.$transaction(async (tx) => {

            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    role: UserRole.HR_MANAGER,
                    status: UserStatus.ACTIVE,
                    passwordHash,
                    passwordResetToken: inviteToken,
                    passwordResetExpires: inviteExpires,
                },
            });

            await tx.employerProfile.create({
                data: {
                    userId: user.id,
                    companyId: companyIdBigInt,
                    positionInCompany: 'HR-менеджер',
                },
            });

            await this.emailService.sendPasswordResetEmail(
                dto.email,
                inviteToken,
            );

            return {
                message: 'HR-менеджер успешно создан',
            };;
        });
    }
}
