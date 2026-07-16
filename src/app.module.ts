import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CandidateModule } from './candidate-profiles/candidate.module';
import { EmployerModule } from './employer-profiles/emloyer.module';
import { EmailModule } from './email/email.module';
import { EmailQueueModule } from './email-queue/email-queue.module';
import { MinioModule } from './minio/minio.module';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CandidateModule,
    EmployerModule,
    EmailModule,
    EmailQueueModule,
    MinioModule,
    JobsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
