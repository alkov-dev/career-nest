import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CandidateModule } from './candidate-profiles/candidate.module';
import { EmployerModule } from './employer-profiles/emloyer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    CandidateModule,
    EmployerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
