import { Injectable, InternalServerErrorException, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async createAnalysis(userId: string, input: string) {
    const user = await this.usersService.findById(userId);
    if (!user || user.quota <= 0) {
      throw new ForbiddenException('Insufficient quota or user not found');
    }

    // Deduct quota
    await this.usersService.updateQuota(userId, 1);

    // Create analysis record
    const analysis = await this.prisma.analysis.create({
      data: {
        userId,
        input,
        status: 'PROCESSING',
      },
    });

    // Trigger N8N webhook asynchronously
    this.triggerN8nWorkflow(analysis.id, input).catch(err => {
      this.logger.error(`Failed to trigger N8N workflow for analysis ${analysis.id}`, err);
    });

    return analysis;
  }

  private async triggerN8nWorkflow(analysisId: string, input: string) {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      this.logger.warn('N8N_WEBHOOK_URL is not set in environment');
      return;
    }

    const payload = {
      analysisId,
      input,
      callbackUrl: `http://host.docker.internal:3000/api/webhooks/n8n`, // Adjust to match exact callback URL if needed, we'll use a relative path logic or configurable
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`N8N webhook returned ${response.status} ${response.statusText}`);
    }
  }

  async handleN8nCallback(analysisId: string, data: any) {
    const { status, result, evidence } = data;
    
    return this.prisma.analysis.update({
      where: { id: analysisId },
      data: {
        status: status || 'COMPLETED',
        result: typeof result === 'string' ? result : JSON.stringify(result),
        evidence: typeof evidence === 'string' ? evidence : JSON.stringify(evidence),
      },
    });
  }

  async getHistory(userId: string) {
    return this.prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAnalysis(id: string, userId: string) {
    return this.prisma.analysis.findFirst({
      where: { id, userId },
    });
  }
}
