import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();
  
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('ClawPilot API')
    .setDescription('AI Agent Orchestration Platform API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('agents', 'Agent management')
    .addTag('teams', 'Team management')
    .addTag('billing', 'Billing & subscriptions')
    .addTag('files', 'File uploads')
    .addTag('search', 'Search functionality')
    .addTag('audit', 'Audit logs')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 ClawPilot API running on port ${port}`);
  console.log(`📚 API docs available at http://localhost:${port}/api/docs`);
}
bootstrap();
