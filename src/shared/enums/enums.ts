export enum UserStatus {
    ACTIVE = 'active',
    PENDING = 'pending'
}

export enum UserRole {
    CANDIDATE = 'candidate',
    HR_MANAGER = 'hr_manager',
    EMPLOYER = 'employer',
    ADMIN = 'admin'
}

export enum EmailType {
    CONFIRMATION = 'confirmation',
    PASSWORD_RESET = 'password-reset',
    NOTIFICATION = 'notification',
}

export enum Mode {
    DEVELOPING = 'developing',
    PRODUCTION = 'production'
}

export enum JobSkillSource {
    MANUAL = 'manual',
    AI_SUGGESTED = 'ai_suggested',
    AI_ACCEPTED = 'ai_accepted',
}

export enum JobSkillType {
    REQUIRED = 'required',
    NICE_TO_HAVE = 'nice_to_have'
} 