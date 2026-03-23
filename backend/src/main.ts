import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  const configService = app.get(ConfigService);
  
  console.log('📝 MongoDB URI:', configService.get<string>('MONGODB_URI') ? 'Set' : 'MISSING');
  console.log('📝 JWT Secret:', configService.get<string>('JWT_SECRET') ? 'Set' : 'MISSING');
  console.log('📝 Port:', configService.get<number>('PORT', 3001));

  // Global prefix (exclude root health check)
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['/', 'health'],
  });

  // CORS - Allow all origins with credentials (temporary for testing)
  console.log('🔐 CORS enabled for ALL origins with credentials');
  
  app.enableCors({
    origin: true, // Allow all origins and reflect the request origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Render automatically sets PORT env var
  const port = process.env.PORT || configService.get<number>('PORT') || 3001;
  
  console.log(`🎯 Using PORT from process.env: ${process.env.PORT}`);
  console.log(`🎯 Final port: ${port}`);
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Application is running on: http://0.0.0.0:${port}/${apiPrefix}`);
  console.log(`🌐 Health check: http://0.0.0.0:${port}/`);
  console.log(`🔑 Auth endpoint: http://0.0.0.0:${port}/${apiPrefix}/auth/register`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
