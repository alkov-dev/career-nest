import { Controller, Get, Param, NotFoundException, UseGuards, Patch, Body, Req } from '@nestjs/common';
import { EmployerService } from './emloyer.service';
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';
import { EmployerProfileResponseDto, UpdateEmployerDto } from '../shared/dto/emloyer-profile.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Public } from '@/auth/decorators/public.decorator';

@ApiTags('Employer Profiles')
@Controller('employers')
export class EmployerController {
    constructor(private employerService: EmployerService) { }

    @Get('all')
    @Public()
    // @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Получить список всех работодателей' })
    @ApiResponse({
        status: 200,
        description: 'Список работодателей',
        type: [EmployerProfileResponseDto],
    })
    async findAll() {
        return this.employerService.findAll();
    }

    @Get(':id')
    // @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Получить профиль работодателя по ID' })
    @ApiParam({ name: 'id', description: 'ID работодателя', example: '1' })
    @ApiResponse({
        status: 200,
        description: 'Профиль найден',
        type: EmployerProfileResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'Работодатель не найден'
    })
    async getProfileById(@Param('id') id: string) {
        return this.employerService.getProfileById(id);
    }


    @Patch(':id')
    // @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Обновить профиль работодателя' })
    @ApiResponse({
        status: 200,
        description: 'Профиль обновлён',
        type: EmployerProfileResponseDto,
    })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateEmployerDto,
        @Req() req: any,
    ) {
        return this.employerService.update(id, dto, req.user?.id);
    }
}