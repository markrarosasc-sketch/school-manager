import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar validaciones globales
  app.useGlobalPipes(new ValidationPipe());
  
  // HABILITAR CORS <--- Agrega esto
  app.enableCors(); 

  await app.listen(3000);
}
bootstrap();