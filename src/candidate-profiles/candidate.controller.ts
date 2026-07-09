import { Controller, Get, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { CandidateService } from './candidate.servise';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';
import { CandidateResponseDto } from './dto/candidate.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@ApiTags('Candidate Profiles')
@Controller('candidates')
export class CandidateController {
    constructor(private candidateService: CandidateService) { }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
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
}