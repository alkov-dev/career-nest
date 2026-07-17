import { Controller, Post, Patch, Body, UseGuards, Request, Param, Delete, Get } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateJobDto } from '@/shared/dto/jobs/create-job.dto';
import { UpdateJobDto } from '@/shared/dto/jobs/update-job.dto';
import { JobPostingResponseDto } from '@/shared/dto/jobs/job-posting-response.dto';
import { ApiResponse, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/shared/enums/enums';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { OpenAiService } from '@/openai/openai.service';

@Controller('jobs')
export class JobsController {
    constructor(
        private readonly jobsService: JobsService,
        private readonly openAiService: OpenAiService,
    ) { }

    @Post('create')
    @ApiOperation({ summary: 'Создать новую вакансию' })
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
    @UseGuards(JwtAuthGuard, RolesGuard)
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



    @Patch(':id')
    @ApiOperation({ summary: 'Частично обновить вакансию (PATCH)' })
    @ApiBearerAuth()
    @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
    @UseGuards(JwtAuthGuard, RolesGuard)
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




    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Мягко удалить вакансию (soft delete)' })
    @ApiParam({ name: 'id', description: 'ID вакансии', example: 23 })
    @ApiResponse({ status: 200, description: 'Вакансия удалена' })
    @ApiResponse({ status: 403, description: 'Нет прав' })
    @ApiResponse({ status: 404, description: 'Вакансия не найдена' })
    async softDelete(
        @Param('id') id: string,
        @Request() req,
    ) {
        const currentUserId = BigInt(req.user.id);
        const jobId = BigInt(id);
        return this.jobsService.softDeleteJob(jobId, currentUserId);
    }




    @Patch('restore/:id')
    @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Восстановить удаленную вакансию' })
    @ApiParam({ name: 'id', description: 'ID вакансии', example: 23 })
    @ApiResponse({ status: 200, description: 'Вакансия восстановлена' })
    @ApiResponse({ status: 403, description: 'Нет прав' })
    @ApiResponse({ status: 404, description: 'Вакансия не найдена' })
    async restore(
        @Param('id') id: string,
        @Request() req,
    ) {
        const currentUserId = BigInt(req.user.id);
        const jobId = BigInt(id);
        return this.jobsService.restoreJob(jobId, currentUserId);
    }




    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Получить вакансию по ID' })
    @ApiParam({ name: 'id', description: 'ID вакансии', example: 23, type: Number })
    @ApiResponse({ status: 200, description: 'Вакансия найдена', type: JobPostingResponseDto })
    @ApiResponse({ status: 404, description: 'Вакансия не найдена или удалена' })
    async findOne(@Param('id') id: string) {
        const jobId = BigInt(id);
        return this.jobsService.getJobById(jobId);
    }


    @Get('test/openai')
    @ApiOperation({ summary: 'Проверка подключения к OpenAI (Ping)' })
    @ApiResponse({ status: 200, description: 'Результат проверки подключения' })
    async testOpenAiConnection() {
        return this.openAiService.testConnection();
    }
}