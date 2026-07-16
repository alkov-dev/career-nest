import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateJobDto } from '@/shared/dto/jobs/create-job.dto';

@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) { }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    async create(@Body() dto: CreateJobDto, @Request() req) {
        // Предполагается, что Guard добавляет пользователя в req.user
        // Адаптируйте под вашу реализацию (например, req.user.sub или req.user.id)
        const currentUserId = BigInt(req.user.id);

        return this.jobsService.createJob(dto, currentUserId);
    }
}