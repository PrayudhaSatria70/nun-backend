import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokenPayload = await this.authService.login(user);
    response.cookie('access_token', tokenPayload.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Use 'none' if backend and frontend are on completely different domains in production
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });
    return { message: 'Login successful' };
  }
}
