import { Controller, Post, Get, Body, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { AnalysisService } from './analysis.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('analyses')
export class AnalysisController {
  constructor(private analysisService: AnalysisService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createAnalysis(@Request() req: any, @Body('input') input: string) {
    return this.analysisService.createAnalysis(req.user.id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Request() req: any) {
    return this.analysisService.getHistory(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getAnalysis(@Request() req: any, @Param('id') id: string) {
    const analysis = await this.analysisService.getAnalysis(id, req.user.id);
    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }
    return analysis;
  }
}
