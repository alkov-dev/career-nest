import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { CreateJobDto } from '@/shared/dto/jobs/create-job.dto';
import { JobPostingResponseDto } from '@/shared/dto/jobs/job-posting-response.dto';


@Injectable()
export class JobsService {
    constructor(private prisma: PrismaService) { }

    async createJob(dto: CreateJobDto, currentUserId: bigint) {
        console.log("🚀 ~ currentUserId:", currentUserId);
        const companyId = BigInt(dto.companyId);
        console.log("🚀 ~ companyId:", companyId);

        // // 1. Проверяем, что пользователь имеет право создавать вакансии для этой компании
        // // (Здесь упрощенная проверка, адаптируйте под вашу логику ролей)
        // const company = await this.prisma.company.findFirst({
        //     where: {
        //         id: companyId,
        //         // Пример: проверяем, что пользователь является владельцем или админом компании
        //         users: {
        //             some: {
        //                 id: currentUserId,
        //                 status: 'active'
        //             }
        //         }
        //     },
        // });

        // if (!company) {
        //     throw new ForbiddenException('У вас нет прав на создание вакансии для этой компании');
        // }

        // // 2. Обрабатываем навыки: находим или создаем их в справочнике
        // const processedJobSkills = dto.jobSkills
        //     ? await Promise.all(dto.jobSkills.map(async (js) => {
        //         const cleanName = js.name.trim();

        //         // UPSERT: если навык есть, берем его ID. Если нет, создаем.
        //         // Если навык предложен ИИ, помечаем его как требующий проверки (needsReview)
        //         const skill = await this.prisma.skill.upsert({
        //             where: { name: cleanName },
        //             update: {},
        //             create: {
        //                 name: cleanName,
        //                 needsReview: js.source !== 'manual'
        //             },
        //         });

        //         return {
        //             skillId: skill.id,
        //             type: js.type,
        //             source: js.source || 'manual',
        //             confidence: js.confidence ? Number(js.confidence) : null,
        //             reason: js.reason || null,
        //             // Автоматический расчет веса для алгоритма матчинга
        //             weight: js.type === 'required' ? 1.5 : 0.5,
        //         };
        //     }))
        //     : [];

        // // 3. Атомарная транзакция создания вакансии и связей
        // const createdJob = await this.prisma.$transaction(async (tx) => {
        //     return tx.job.create({
        //         data: {
        //             companyId,
        //             title: dto.title,
        //             department: dto.department,
        //             location: dto.location,
        //             remoteOption: dto.remoteOption,
        //             salaryMin: dto.salaryRange.min,
        //             salaryMax: dto.salaryRange.max,
        //             currency: dto.salaryRange.currency,
        //             description: dto.description,
        //             requirements: dto.requirements,
        //             responsibilities: dto.responsibilities || [],
        //             niceToHave: dto.niceToHave || [],
        //             skills: dto.skills || [], // Сохраняем денормализованный массив для быстрых запросов
        //             experienceLevel: dto.experienceLevel,
        //             employmentType: dto.employmentType,
        //             benefits: dto.benefits || [],
        //             status: dto.status,
        //             // Вложенное создание связей
        //             jobSkills: {
        //                 create: processedJobSkills,
        //             },
        //         },
        //         include: {
        //             jobSkills: {
        //                 include: {
        //                     skill: true, // Подтягиваем имя навыка из справочника
        //                 },
        //             },
        //         },
        //     });
        // });

        // // 4. Маппим ответ БД в формат, который ждет фронтенд
        // return plainToInstance(JobPostingResponseDto, createdJob, {
        //     excludeExtraneousValues: true,
        // });
    }
}