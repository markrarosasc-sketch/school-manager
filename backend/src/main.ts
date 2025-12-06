import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  
  // Habilitar CORS para que Vercel pueda entrar
  app.enableCors({
    origin: '*', // Ojo: En producción idealmente pones tu dominio de Vercel
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // EL CAMBIO IMPORTANTE: Usar la variable PORT que nos da Render
  await app.listen(process.env.PORT || 3000); 
}
bootstrap();