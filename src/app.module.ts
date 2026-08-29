import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AnalysisModule } from './analysis/analysis.module.js';
import { WebhookModule } from './webhook/webhook.module.js';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, AnalysisModule, WebhookModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
