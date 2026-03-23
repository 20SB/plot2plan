import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private configService: ConfigService) {}

  @Get()
  getHealth() {
    return {
      status: 'ok',
      message: 'Plot2Plan API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: this.configService.get<string>('NODE_ENV'),
      mongodbConfigured: !!this.configService.get<string>('MONGODB_URI'),
      jwtConfigured: !!this.configService.get<string>('JWT_SECRET'),
      port: this.configService.get<number>('PORT'),
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
