import { Controller, Post, Body, Param } from '@nestjs/common';
import { AnalysisService } from '../analysis/analysis.service.js';

@Controller('webhooks')
export class WebhookController {
  constructor(private analysisService: AnalysisService) {}

  @Post('n8n')
  async n8nCallback(@Body() body: any) {
    // The webhook payload needs to contain the analysisId, status, and result
    const { analysisId, ...data } = body;
    if (!analysisId) {
      return { success: false, message: 'Missing analysisId' };
    }
    
    await this.analysisService.handleN8nCallback(analysisId, data);
    return { success: true };
  }
}
