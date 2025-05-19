import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const corsOptions = {
    origin: [
      'http://localhost:4200',
      'http://localhost:3005',
      'http://localhost:3000',
    ],
  };
  app.enableCors(corsOptions);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // retire tout les champs qui ne sont pas déclaré dans la DTO
      forbidNonWhitelisted: true, // rejette les requêtes qui contiennent des champs non déclaré dans la DTO,
    }),
  );
  const PORT = configService.get('APP_PORT') || 3500;
  await app.listen(PORT, () => {
    console.log(
      `Server is running on port ${PORT} visit http://localhost:${PORT}`,
    );
  });
}
bootstrap();
