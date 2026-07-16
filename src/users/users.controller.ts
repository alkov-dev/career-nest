import { Roles } from '@/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UserRole } from '@/shared/enums/enums';
import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateHrUserDto } from '@/shared/dto/register-company.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
    constructor(
        private usersService: UsersService,
    ) { }


    @Post('create-hr')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Приглашение hr-менеджера' })
    @Roles(UserRole.ADMIN)
    create(@Body() createDto: CreateHrUserDto, @Request() req) {
        return this.usersService.createHrUser(createDto, BigInt(req.user.id));
    }
}
