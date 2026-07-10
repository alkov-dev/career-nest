import { Module } from '@nestjs/common';
import { EmployerService } from './emloyer.service';
import { EmployerController } from './emloyer.controller';

@Module({
    controllers: [EmployerController],
    providers: [EmployerService],
    exports: [EmployerService],
})
export class EmployerModule { }