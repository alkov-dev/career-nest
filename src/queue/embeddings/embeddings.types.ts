export const EMBEDDINGS_QUEUE_NAME = 'embeddings';

export type EmbeddingEntityType = 'job' | 'skill';

export interface EmbeddingJobData {
    entityType: EmbeddingEntityType;
    entityId: string; // string для безопасной сериализации BigInt в JSON очереди
}