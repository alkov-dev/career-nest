import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { CreateJobDto } from '@/shared/dto/jobs/create-job.dto';
import { JobPostingResponseDto } from '@/shared/dto/jobs/job-posting-response.dto';
import { UpdateJobDto } from '@/shared/dto/jobs/update-job.dto';


@Injectable()
export class JobsService {
    constructor(private prisma: PrismaService) { }

    async createJob(dto: CreateJobDto, currentUserId: bigint) {
        const employerProfile = await this.prisma.employerProfile.findUnique({
            where: { userId: currentUserId },
            select: { companyId: true },
        });

        if (!employerProfile?.companyId) {
            throw new BadRequestException('У вас нет привязанной компании');
        }

        const companyId = employerProfile.companyId;


        // 1. Проверяем, что пользователь имеет право создавать вакансии для этой компании
        // (Здесь упрощенная проверка, адаптируйте под вашу логику ролей)
        // const company = await this.prisma.company.findFirst({
        //     where: {
        //         id: companyId,
        //         users: {
        //             some: {
        //                 id: currentUserId,
        //                 status: 'active'
        //             }
        //         }
        //     },
        // });
        // console.log("🚀 ~ company:", company);

        // if (!company) {
        //     throw new ForbiddenException('У вас нет прав на создание вакансии для этой компании');
        // }

        // 2. Обрабатываем навыки: находим или создаем их в справочнике
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

        // const processedJobSkills: any[] = []; //заглушка потом надо удалить

        // Временно создаем тестовые навыки


        // 3. Атомарная транзакция создания вакансии и связей
        const createdJob = await this.prisma.$transaction(async (tx) => {
            //временно
            const testSkill1 = await tx.skill.upsert({
                where: { name: 'Продуктовая стратегия' },
                update: {},
                create: { name: 'Продуктовая стратегия', category: 'other', needsReview: true },
            });
            //временно
            const testSkill2 = await tx.skill.upsert({
                where: { name: 'Аналитика' },
                update: {},
                create: { name: 'Аналитика', category: 'other', needsReview: true },
            });


            return tx.job.create({
                data: {
                    companyId,
                    title: dto.title,
                    department: dto.department,
                    location: dto.location,
                    remoteOption: dto.remoteOption,
                    salaryMin: dto.salaryRange.min,
                    salaryMax: dto.salaryRange.max,
                    currency: dto.salaryRange.currency,
                    description: dto.description,
                    requirements: dto.requirements,
                    responsibilities: dto.responsibilities || [],
                    niceToHave: dto.niceToHave || [],
                    skills: dto.skills || [], // Сохраняем денормализованный массив для быстрых запросов
                    experienceLevel: dto.experienceLevel,
                    employmentType: dto.employmentType,
                    benefits: dto.benefits || [],
                    status: dto.status,
                    jobSkills: {
                        //временно
                        create: [
                            {
                                skillId: testSkill1.id,
                                type: 'required',
                                source: 'manual',
                                weight: 1.5,
                                confidence: 0.94,
                                reason: 'Ключевой навык для продуктового менеджера'
                            },
                            {
                                skillId: testSkill2.id,
                                type: 'nice_to_have',
                                source: 'manual',
                                weight: 0.5,
                                confidence: 0.88,
                                reason: 'Полезно для анализа метрик'
                            },
                        ],
                    },
                },
                include: {
                    jobSkills: {
                        include: {
                            skill: true, // Подтягиваем имя навыка из справочника
                        },
                    },
                },
            });
        });

        return {
            id: createdJob.id,
            title: createdJob.title,
            department: createdJob.department,
            location: createdJob.location,
            remoteOption: createdJob.remoteOption,

            salaryRange: {
                min: Number(createdJob.salaryMin ?? 0),
                max: Number(createdJob.salaryMax ?? 0),
                currency: createdJob.currency ?? 'RUB',
            },

            description: createdJob.description,
            requirements: createdJob.requirements,
            responsibilities: createdJob.responsibilities,
            niceToHave: createdJob.niceToHave,
            skills: createdJob.skills,
            experienceLevel: createdJob.experienceLevel,
            employmentType: createdJob.employmentType,
            benefits: createdJob.benefits,
            status: createdJob.status,
            applicantCount: createdJob.applicationCount ?? 0,
            aiMatchCount: createdJob.aiMatchCount ?? 0,
            createdAt: createdJob.createdAt,
            updatedAt: createdJob.updatedAt,

            jobSkills: createdJob.jobSkills.map(js => ({
                skillId: js.skillId,
                name: js.skill.name,
                type: js.type,
                reason: js.reason,
                confidence: js.confidence ? Number(js.confidence) : null,
                source: js.source,
            })),
        };
    }


    async updateJob(jobId: bigint, dto: UpdateJobDto, currentUserId: bigint) {
        const existingJob = await this.prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!existingJob) {
            throw new NotFoundException('Вакансия не найдена');
        }

        const employerProfile = await this.prisma.employerProfile.findUnique({
            where: { userId: currentUserId },
            select: { companyId: true },
        });

        if (!employerProfile || employerProfile.companyId !== existingJob.companyId) {
            throw new ForbiddenException('Вы можете редактировать только вакансии своей компании');
        }

        let jobSkillsData: any[] = [];
        if (dto.jobSkills !== undefined) {
            for (const js of dto.jobSkills) {
                const cleanName = js.name.trim();

                const skill = await this.prisma.skill.upsert({
                    where: { name: cleanName },
                    update: {},
                    create: {
                        name: cleanName,
                        category: 'other',
                        needsReview: js.source !== 'manual',
                    },
                });

                jobSkillsData.push({
                    skillId: skill.id,
                    type: js.type,
                    source: js.source || 'manual',
                    confidence: js.confidence ? Number(js.confidence) : null,
                    reason: js.reason || null,
                    weight: js.type === 'required' ? 1.5 : 0.5,
                });
            }
        }


        const updatedJob = await this.prisma.$transaction(async (tx) => {
            const job = await tx.job.update({
                where: { id: jobId },
                data: {
                    title: dto.title,
                    department: dto.department,
                    location: dto.location,
                    remoteOption: dto.remoteOption,
                    salaryMin: dto.salaryRange?.min,
                    salaryMax: dto.salaryRange?.max,
                    currency: dto.salaryRange?.currency,
                    description: dto.description,
                    requirements: dto.requirements,
                    responsibilities: dto.responsibilities,
                    niceToHave: dto.niceToHave,
                    skills: dto.skills,
                    experienceLevel: dto.experienceLevel,
                    employmentType: dto.employmentType,
                    benefits: dto.benefits,
                    status: dto.status,
                    applicationCount: dto.applicantCount,
                    aiMatchCount: dto.aiMatchCount,
                },
            });

            // if (dto.jobSkills !== undefined) {
            //     // 1. Удаляенавыковм старые связи  с этой вакансией
            //     await tx.jobSkill.deleteMany({
            //         where: { jobId },
            //     });

            //     // 2. Создаем новые связи (если массив не пустой)
            //     if (jobSkillsData.length > 0) {
            //         await tx.jobSkill.createMany({
            //             data: jobSkillsData.map(data => ({
            //                 ...data,
            //                 jobId, // Привязываем к текущей вакансии
            //             })),
            //         });
            //     }
            // }

            return tx.job.findUnique({
                where: { id: jobId },
                include: {
                    jobSkills: {
                        include: {
                            skill: true,
                        },
                    },
                },
            });
        });

        if (!updatedJob) {
            throw new NotFoundException('Вакансия не найдена после обновления');
        }

        return {
            id: updatedJob.id,
            title: updatedJob.title,
            department: updatedJob.department,
            location: updatedJob.location,
            remoteOption: updatedJob.remoteOption,
            salaryRange: {
                min: Number(updatedJob.salaryMin ?? 0),
                max: Number(updatedJob.salaryMax ?? 0),
                currency: updatedJob.currency ?? 'RUB',
            },
            description: updatedJob.description,
            requirements: updatedJob.requirements,
            responsibilities: updatedJob.responsibilities,
            niceToHave: updatedJob.niceToHave,
            skills: updatedJob.skills,
            experienceLevel: updatedJob.experienceLevel,
            employmentType: updatedJob.employmentType,
            benefits: updatedJob.benefits,
            status: updatedJob.status,
            applicantCount: updatedJob.applicationCount ?? 0,
            aiMatchCount: updatedJob.aiMatchCount ?? 0,
            createdAt: updatedJob.createdAt,
            updatedAt: updatedJob.updatedAt,
            jobSkills: updatedJob.jobSkills.map(js => ({
                skillId: js.skillId,
                name: js.skill.name,
                type: js.type,
                reason: js.reason,
                confidence: js.confidence ? Number(js.confidence) : null,
                source: js.source,
            })),
        };
    }
}



