// src/openai/openai.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
    private readonly logger = new Logger(OpenAiService.name);
    private readonly client: OpenAI;
    private readonly chatModel: string;
    private readonly embeddingModel: string;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not defined in environment variables');
        }

        this.client = new OpenAI({ apiKey });
        this.chatModel = this.configService.get<string>('OPENAI_CHAT_MODEL') || 'gpt-4o-mini';
        this.embeddingModel = this.configService.get<string>('OPENAI_EMBEDDING_MODEL') || 'text-embedding-3-small';
    }

    /**
     * Извлечение структурированных данных (JSON) из текста
     * Теперь поддерживает OpenAI Structured Outputs через schema
     */
    async extractJson(systemPrompt: string, userText: string, schema?: object): Promise<any> {
        try {
            const response = await this.client.chat.completions.create({
                model: this.chatModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userText },
                ],
                // Если передана схема, используем строгий режим (требует gpt-4o или gpt-4o-mini)
                response_format: schema
                    ? {
                        type: 'json_schema',
                        json_schema: {
                            name: 'extracted_data',
                            schema: schema as any,
                            strict: true
                        }
                    }
                    : { type: 'json_object' }
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error('Empty response from OpenAI');

            // Очистка от markdown (на случай, если модель все же добавила обертку)
            const cleanJson = content.replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/i, '$1').trim();

            return JSON.parse(cleanJson);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Failed to extract JSON: ${errorMessage}`, errorStack);
            throw error;
        }
    }

    async generateEmbedding(text: string): Promise<number[]> {
        try {
            const response = await this.client.embeddings.create({
                model: this.embeddingModel,
                input: text,
                dimensions: 1536, // КРИТИЧЕСКИ ВАЖНО для VECTOR(1536)
            });
            return response.data[0].embedding;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to generate embedding: ${errorMessage}`);
            throw error;
        }
    }

    async testConnection() {
        try {
            // 1. Тестируем чат (минимальный запрос)
            const chatRes = await this.client.chat.completions.create({
                model: this.chatModel,
                messages: [{ role: 'user', content: 'Ответь одним словом: OK' }],
                max_completion_tokens: 5,
            });

            // 2. Тестируем эмбеддинг (проверяем, что dimensions: 1536 работает)
            const embRes = await this.client.embeddings.create({
                model: this.embeddingModel,
                input: 'test connection',
                dimensions: 1536,
            });

            return {
                status: '✅ SUCCESS',
                chatModel: this.chatModel,
                embeddingModel: this.embeddingModel,
                chatResponse: chatRes.choices[0].message.content?.trim(),
                embeddingDimensions: embRes.data[0].embedding.length,
                message: 'Подключение к OpenAI установлено успешно!'
            };
        } catch (error: any) {
            return {
                status: '❌ ERROR',
                chatModel: this.chatModel,
                embeddingModel: this.embeddingModel,
                errorMessage: error.message,
                errorCode: error.status || error.code,
                hint: 'Проверьте OPENAI_API_KEY и доступность модели в вашем аккаунте.'
            };
        }
    }
}