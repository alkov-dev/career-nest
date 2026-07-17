import { Controller, Post, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateJobDto } from '@/shared/dto/jobs/create-job.dto';
import { UpdateJobDto } from '@/shared/dto/jobs/update-job.dto';
import { JobPostingResponseDto } from '@/shared/dto/jobs/job-posting-response.dto';
import { ApiResponse, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/shared/enums/enums';

@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) { }

    @Post('create')
    @ApiOperation({ summary: 'Создать новую вакансию' })
    // @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
    @UseGuards(JwtAuthGuard)
    @ApiResponse({
        status: 201,
        description: 'Вакансия успешно создана',
        type: JobPostingResponseDto
    })
    @ApiResponse({
        status: 400,
        description: 'Ошибка валидации данных (неверный формат полей)'
    })
    @ApiResponse({
        status: 401,
        description: 'Неавторизованный запрос (отсутствует или невалидный JWT токен)'
    })
    @ApiResponse({
        status: 403,
        description: 'Нет прав на создание вакансии для данной компании'
    })
    @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
    async create(@Body() dto: CreateJobDto, @Request() req) {
        const currentUserId = BigInt(req.user.id);

        return this.jobsService.createJob(dto, currentUserId);
    }

    @Patch('update/:id')
    @ApiOperation({ summary: 'Частично обновить вакансию (PATCH)' })
    // @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
    @UseGuards(JwtAuthGuard)
    @ApiParam({ name: 'id', description: 'ID вакансии', example: 18, type: Number })
    @ApiResponse({ status: 200, description: 'Вакансия успешно обновлена', type: JobPostingResponseDto })
    @ApiResponse({ status: 404, description: 'Вакансия не найдена' })
    @ApiResponse({ status: 403, description: 'Нет прав на редактирование' })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateJobDto,
        @Request() req
    ) {
        const currentUserId = BigInt(req.user.id);
        const jobId = BigInt(id);

        return this.jobsService.updateJob(jobId, dto, currentUserId);
    }
}