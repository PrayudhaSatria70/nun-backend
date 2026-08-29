import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller.js';
import { AnalysisModule } from '../analysis/analysis.module.js';

@Module({
  imports: [AnalysisModule],
  controllers: [WebhookController],
})
export class WebhookModule {}
