import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { EmbeddingsQueueModule } from '@/queue/embeddings/embeddings-queue.module';


@Module({
    imports: [PrismaModule, EmbeddingsQueueModule],
    controllers: [JobsController],
    providers: [JobsService],
    exports: [JobsService],
})
export class JobsModule { }