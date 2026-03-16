import { Module } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // API prefix
  app.setGlobalPrefix('api');
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('ClawPilot API')
    .setDescription('AI Agent Management Platform - API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Agents', 'Agent management endpoints')
    .addTag('Templates', 'Agent template endpoints')
    .addTag('Billing', 'Billing and subscription endpoints')
    .addTag('Metrics', 'Analytics and metrics endpoints')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 ClawPilot API running on port ${port}`);
  console.log(`📚 API docs available at http://localhost:${port}/api/docs`);
}
bootstrap();
