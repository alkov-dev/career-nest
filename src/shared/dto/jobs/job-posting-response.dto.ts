import { Expose, Type } from 'class-transformer';

export class JobSkillResponseDto {
    @Expose()
    skillId!: number;

    @Expose()
    name!: string;

    @Expose()
    type!: 'required' | 'nice_to_have';

    @Expose()
    reason?: string;

    @Expose()
    confidence?: number;

    @Expose()
    source?: 'manual' | 'ai_suggested' | 'ai_accepted';
}

export class JobPostingResponseDto {
    @Expose()
    id!: string;

    @Expose({ name: 'companyId' })
    companyId!: string;

    @Expose()
    title!: string;

    @Expose()
    department?: string | null;

    @Expose()
    location?: string | null;

    @Expose()
    remoteOption?: 'remote' | 'hybrid' | 'onsite' | null;

    @Expose()
    get salaryRange() {
        return {
            min: this.salaryMin ?? 0,
            max: this.salaryMax ?? 0,
            currency: this.currency ?? 'RUB',
        };
    }

    salaryMin?: number | null;
    salaryMax?: number | null;
    currency?: string | null;

    @Expose()
    description?: string | null;

    @Expose()
    requirements!: string[];

    @Expose()
    responsibilities!: string[];

    @Expose()
    niceToHave!: string[];

    @Expose()
    skills!: string[];

    @Expose()
    experienceLevel?: string | null;

    @Expose()
    employmentType?: string | null;

    @Expose()
    benefits!: string[];

    @Expose()
    status!: 'draft' | 'active' | 'paused' | 'closed';

    @Expose()
    applicantCount!: number;

    @Expose()
    aiMatchCount!: number;

    @Expose()
    createdAt!: string;

    @Expose()
    updatedAt!: string;

    @Expose()
    @Type(() => JobSkillResponseDto)
    jobSkills!: JobSkillResponseDto[];
}