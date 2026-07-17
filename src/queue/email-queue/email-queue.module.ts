import { Module, Global } from '@nestjs/common';
import { EmailQueueService } from './email-queue.service';
import { EmailQueueProcessor } from './email-queue.processor';

@Global()
@Module({
    providers: [EmailQueueService, EmailQueueProcessor],
    exports: [EmailQueueService],
})
export class EmailQueueModule { }