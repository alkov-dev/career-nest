import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateJobDto } from '@/shared/dto/jobs/create-job.dto';
import { UpdateJobDto } from '@/shared/dto/jobs/update-job.dto';
import { OpenAiService } from '@/openai/openai.service';
import { SKILL_EXTRACTION_PROMPT, SKILL_EXTRACTION_SCHEMA } from '@/ai/prompts/create-skills/skill-extraction.prompt';
import { JobSkillSource, JobSkillType } from '@/shared/enums/enums';
import { EmbeddingsQueueService } from '@/queue/embeddings/embeddings-queue.service';



@Injectable()
export class JobsService {
    constructor(
        private prisma: PrismaService,
        private openAiService: OpenAiService,
        private embeddingsQueueService: EmbeddingsQueueService,
    ) { }

    async createJob(dto: CreateJobDto, currentUserId: bigint) {
        const employerProfile = await this.prisma.employerProfile.findUnique({
            where: { userId: currentUserId },
            select: { companyId: true },
        });

        if (!employerProfile?.companyId) {
            throw new BadRequestException('У вас нет привязанной компании');
        }

        const companyId = employerProfile.companyId;

        const manualSkillsList = dto.jobSkills
            ? dto.jobSkills.map(js => `- ${js.name} (тип: ${js.type})`).join('\n')
            : 'Нет';

        const textToAnalyze = `
            Название: ${dto.title}
            Описание: ${dto.description}
            Требования: ${dto.requirements?.join('; ') || 'Нет'}
            Обязанности: ${dto.responsibilities?.join('; ') || 'Нет'}
            Будет плюсом: ${dto.niceToHave?.join('; ') || 'Нет'}
        `;

        const finalPrompt = SKILL_EXTRACTION_PROMPT
            .replace('{manualSkills}', manualSkillsList)
            .replace('{jobText}', textToAnalyze);

        const aiResponse = await this.openAiService.extractJson(
            finalPrompt,
            '',
            SKILL_EXTRACTION_SCHEMA
        );

        const canonicalizedSkills = aiResponse?.skills || [];

        const highConfidenceSkills = canonicalizedSkills.filter(
            (skill: any) => skill.confidence >= 0.98
        );

        const processedSkillIds: bigint[] = [];

        const createdJob = await this.prisma.$transaction(async (tx) => {
            const jobSkillsCreateData: {
                skillId: bigint;
                type: string;
                source: string;
                confidence: number | null;
                reason: string | null;
                weight: number;
            }[] = [];

            for (const skillData of highConfidenceSkills) {
                const cleanName = skillData.name.trim();

                const skill = await tx.skill.upsert({
                    where: { name: cleanName },
                    update: {},
                    create: {
                        name: cleanName,
                        category: skillData.category,
                        needsReview: skillData.source !== JobSkillSource.MANUAL,
                    },
                });

                processedSkillIds.push(skill.id);

                if (skillData.source === JobSkillSource.MANUAL) {
                    jobSkillsCreateData.push({
                        skillId: skill.id,
                        type: skillData.type,
                        source: skillData.source,
                        confidence: skillData.confidence,
                        reason: skillData.reason,
                        weight: skillData.type === JobSkillType.REQUIRED ? 1.5 : 0.5,
                    });
                }

                const aliasesToCreate = (skillData.originalNames ?? [])
                    .map((n: string) => n.trim())
                    .filter((alias): alias is string => Boolean(alias) && alias !== cleanName)
                    .map((alias) => ({ skillId: skill.id, alias }));

                if (aliasesToCreate.length > 0) {
                    await tx.skillAlias.createMany({
                        data: aliasesToCreate,
                        skipDuplicates: true,
                    });
                }

            }

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
                    skills: dto.skills || [],
                    experienceLevel: dto.experienceLevel,
                    employmentType: dto.employmentType,
                    benefits: dto.benefits || [],
                    status: dto.status,
                    applicationCount: dto.applicantCount ?? 0,
                    aiMatchCount: dto.aiMatchCount ?? 0,
                    jobSkills: {
                        create: jobSkillsCreateData,
                    },
                },
                include: {
                    jobSkills: {
                        include: {
                            skill: true,
                        },
                    },
                },
            });
        });

        await this.embeddingsQueueService.addEmbeddingJob('job', createdJob.id.toString());

        for (const skillId of processedSkillIds) {
            await this.embeddingsQueueService.addEmbeddingJob('skill', skillId.toString());
        }


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
                        needsReview: js.source !== JobSkillSource.MANUAL,
                    },
                });

                jobSkillsData.push({
                    skillId: skill.id,
                    type: js.type,
                    source: js.source || JobSkillSource.MANUAL,
                    confidence: js.confidence ? Number(js.confidence) : null,
                    reason: js.reason || null,
                    weight: js.type === JobSkillType.REQUIRED ? 1.5 : 0.5,
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

    async softDeleteJob(jobId: bigint, currentUserId: bigint) {

        const existingJob = await this.prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!existingJob) {
            throw new NotFoundException('Вакансия не найдена');
        }

        if (existingJob.deletedAt) {
            throw new BadRequestException('Вакансия уже удалена');
        }

        const currentUser = await this.prisma.user.findUnique({
            where: { id: currentUserId },
            select: { id: true, role: true },
        });

        if (!currentUser) {
            throw new NotFoundException('Пользователь не найден');
        }

        const employerProfile = await this.prisma.employerProfile.findUnique({
            where: { userId: currentUserId },
            select: { companyId: true },
        });

        if (!employerProfile || employerProfile.companyId !== existingJob.companyId) {
            throw new ForbiddenException('Вы можете удалять только вакансии своей компании');
        }

        await this.prisma.job.update({
            where: { id: jobId },
            data: { deletedAt: new Date() },
        });

        return {
            success: true,
            message: 'Вакансия успешно удалена',
            jobId,
        };
    }

    async restoreJob(jobId: bigint, currentUserId: bigint) {
        const existingJob = await this.prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!existingJob) {
            throw new NotFoundException('Вакансия не найдена');
        }

        if (!existingJob.deletedAt) {
            throw new BadRequestException('Вакансия не была удалена');
        }

        const currentUser = await this.prisma.user.findUnique({
            where: { id: currentUserId },
            select: { id: true, role: true },
        });

        if (!currentUser) {
            throw new NotFoundException('Пользователь не найден');
        }


        const employerProfile = await this.prisma.employerProfile.findUnique({
            where: { userId: currentUserId },
            select: { companyId: true },
        });

        if (!employerProfile || employerProfile.companyId !== existingJob.companyId) {
            throw new ForbiddenException('Вы можете восстанавливать только вакансии своей компании');
        }


        await this.prisma.job.update({
            where: { id: jobId },
            data: { deletedAt: null },
        });

        return {
            success: true,
            message: 'Вакансия восстановлена',
            jobId,
        };
    }

    async getJobById(jobId: bigint) {
        const job = await this.prisma.job.findUnique({
            where: {
                id: jobId,
                deletedAt: null,
            },
            include: {
                jobSkills: {
                    include: {
                        skill: true,
                    },
                },
            },
        });

        if (!job) {
            throw new NotFoundException('Вакансия не найдена или удалена');
        }

        return {
            id: job.id,
            companyId: job.companyId,
            title: job.title,
            department: job.department,
            location: job.location,
            remoteOption: job.remoteOption,
            salaryRange: {
                min: Number(job.salaryMin ?? 0),
                max: Number(job.salaryMax ?? 0),
                currency: job.currency ?? 'RUB',
            },
            description: job.description,
            requirements: job.requirements,
            responsibilities: job.responsibilities,
            niceToHave: job.niceToHave,
            skills: job.skills,
            experienceLevel: job.experienceLevel,
            employmentType: job.employmentType,
            benefits: job.benefits,
            status: job.status,
            applicantCount: job.applicationCount ?? 0,
            aiMatchCount: job.aiMatchCount ?? 0,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
            jobSkills: job.jobSkills.map(js => ({
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



