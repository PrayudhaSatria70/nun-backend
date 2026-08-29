import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service.js';
import { AnalysisController } from './analysis.controller.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [UsersModule],
  providers: [AnalysisService],
  controllers: [AnalysisController],
  exports: [AnalysisService],
})
export class AnalysisModule {}
