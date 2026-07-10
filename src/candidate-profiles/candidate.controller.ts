import { Controller, Get, Param, NotFoundException, UseGuards, Patch, Body, Req } from '@nestjs/common';
import { CandidateService } from './candidate.service';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Public } from '@/auth/decorators/public.decorator';
import { CandidateResponseDto, UpdateCandidateDto } from '@/shared/dto/candidate-profile.dto';

@ApiTags('Candidate Profiles')
@Controller('candidates')
export class CandidateController {
    constructor(private candidateService: CandidateService) { }

    @Get('all')
    @Public()
    @ApiOperation({ summary: 'Получить список всех кандидатов' })
    @ApiResponse({
        status: 200,
        description: 'Список кандидатов',
        type: [CandidateResponseDto],
    })
    async findAll() {
        return this.candidateService.findAll();
    }

    @Get(':id')
    // @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Получить профиль кандидата по ID' })
    @ApiParam({ name: 'id', description: 'ID кандидата', example: '1' })
    @ApiResponse({
        status: 200,
        description: 'Профиль найден',
        type: CandidateResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Кандидат не найден'
    })
    async getProfileById(@Param('id') id: string) {
        return this.candidateService.getProfileById(id);
    }


    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Обновить профиль кандидата' })
    @ApiResponse({
        status: 200,
        description: 'Профиль обновлён',
        type: CandidateResponseDto,
    })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateCandidateDto,
        @Req() req: any,
    ) {
        return this.candidateService.update(id, dto, req.user?.id);
    }
}