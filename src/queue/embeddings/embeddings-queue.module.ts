import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmbeddingsQueueService } from './embeddings-queue.service';
import { EmbeddingsQueueProcessor } from './embeddings-queue.processor';
import { PrismaService } from '@/prisma/prisma.service';
import { OpenAiService } from '@/openai/openai.service';
import { QueueModule } from '../queue.module';

@Module({
    providers: [
        EmbeddingsQueueService,
        EmbeddingsQueueProcessor,
        PrismaService,
        OpenAiService,
    ],
    exports: [
        EmbeddingsQueueService,
    ],
})
export class EmbeddingsQueueModule { }