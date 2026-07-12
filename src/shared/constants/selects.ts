export const employerProfile = {
    id: true,
    userId: true,
    updatedAt: true,
    createdAt: true,
    companyId: true,
    positionInCompany: true,
}

export const cvUpload = {
    id: true,
    userId: true,
    createdAt: true,
    status: true,
    originalUrl: true,
    mimeType: true,
    sizeBytes: true,
    extractedText: true,
    parsedJson: true,
    confidence: true,
    errorMessage: true,
    parsedAt: true,
    expiresAt: true,
    reviewedAt: true,
}

export const skills = {
    profileId: true,
    updatedAt: true,
    createdAt: true,
    skillId: true,
    level: true,
    years: true,
}

export const applications = {
    id: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    candidateProfileId: true,
    jobId: true,
    coverLetterId: true,
}

export const cvAnalyses = {
    id: true,
    summary: true,
    createdAt: true,
    updatedAt: true,
    profileId: true,
    level: true,
    overallScore: true,
    details: true,
    evaluationPromptVersion: true,
    llmModel: true,
    tokensUsed: true,
    llmConfidence: true,
    rawLlmResponse: true,
    isCurrent: true,
}

export const cvResumeInsights = {
    id: true,
    updatedAt: true,
    profileId: true,
    llmModel: true,
    tokensUsed: true,
    cvAnalysisId: true,
    explanationDetailed: true,
    improvementPlan: true,
    recommendedCourses: true,
    ragChunkIds: true,
    insightPromptVersion: true,
    isStale: true,
    staleReason: true,
    generatedForProfileHash: true,
    generatedAt: true,
}

export const experiences = {
    id: true,
    createdAt: true,
    updatedAt: true,
    profileId: true,
    company: true,
    position: true,
    startDate: true,
    endDate: true,
    current: true,
    description: true,
    technologies: true,
    sortOrder: true,
}

export const matchScores = {
    id: true,
    updatedAt: true,
    candidateProfileId: true,
    jobId: true,
    details: true,
    score: true,
    computedAt: true,
}

export const languages = {
    createdAt: true,
    profileId: true,
    level: true,
    languageId: true,
}

export const savedJobs = {
    createdAt: true,
    candidateProfileId: true,
    jobId: true,
}

export const jobHistory = {
    id: true,
    createdAt: true,
    jobId: true,
    editorId: true,
    changedFields: true,
    previousValues: true,
}

export const message = {
    content: true,
    id: true,
    createdAt: true,
    senderId: true,
    receiverId: true,
    applicationId: true,
    isRead: true,
}

export const notification = {
    type: true,
    id: true,
    createdAt: true,
    userId: true,
    title: true,
    payload: true,
    readAt: true,
}

export const candidateSelect = {
    id: true,
    userId: true,
    fullName: true,
    city: true,
    cityCanonical: true,
    summary: true,
    salaryMin: true,
    salaryMax: true,
    currency: true,
    remoteOk: true,
    willingToRelocate: true,
    totalExperienceYears: true,
    originalCvUrl: true,
    isActive: true,
    createdAt: true,
    cvUpload: {
        select: cvUpload
    },
    skills: {
        select: skills,
    },
    applications: {
        select: applications,
    },
    cvAnalyses: {
        select: cvAnalyses,
    },
    cvResumeInsights: {
        select: cvResumeInsights
    },
    experiences: {
        select: experiences
    },
    matchScores: {
        select: matchScores
    },
    languages: {
        select: languages
    },
    savedJobs: {
        select: savedJobs
    }
}

export const coverLetter = {
    id: true,
    userId: true,
    jobId: true,
    generatedAt: true,
    profileSnapshot: true,
    letterText: true,
    metadata: true,
    usedInApplication: true,
}

export const userSelect = {
    id: true,
    email: true,
    emailConfirmExpires: true,
    passwordResetExpires: true,
    role: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    candidateProfile: {
        select: candidateSelect
    },
    employerProfile: {
        select: employerProfile
    },
    coverLetters: {
        select: coverLetter
    },
    cvUploads: {
        select: cvUpload
    },
    jobHistory: {
        select: jobHistory
    },
    receivedMessages: {
        select: message
    },
    sentMessages: {
        select: message
    },
    notifications: {
        select: notification
    }
} 