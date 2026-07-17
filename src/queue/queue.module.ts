import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
    imports: [
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                connection: {
                    host: configService.get<string>('REDIS_HOST', 'localhost'),
                    port: configService.get<number>('REDIS_PORT', 6379),
                },
                defaultJobOptions: {
                    removeOnComplete: 100,
                    removeOnFail: 1000,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                },
            }),
            inject: [ConfigService],
        }),

        BullModule.registerQueue(
            { name: 'email' },
            { name: 'embeddings' },
        ),
    ],
    exports: [
        BullModule,
    ],
})
export class QueueModule { }