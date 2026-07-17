import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmbeddingEntityType } from './embeddings.types';


export interface EmbeddingJobData {
    entityType: EmbeddingEntityType;
    entityId: string;
}

@Injectable()
export class EmbeddingsQueueService {
    private readonly logger = new Logger(EmbeddingsQueueService.name);

    constructor(
        @InjectQueue('embeddings') private readonly embeddingsQueue: Queue,
    ) { }

    async addEmbeddingJob(entityType: EmbeddingEntityType, entityId: string): Promise<void> {
        const job = await this.embeddingsQueue.add('generate-embedding', { entityType, entityId }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true,
            removeOnFail: 50,
        });

        this.logger.log(`🧠 Queue: Added embedding task for ${entityType} #${entityId} (Job ID: ${job.id})`);
    }
}