import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CandidateModule } from './candidate-profiles/candidate.module';
import { EmployerModule } from './employer-profiles/emloyer.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    CandidateModule,
    EmployerModule,
    EmailModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
