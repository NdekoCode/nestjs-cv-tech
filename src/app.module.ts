import { ValidDBType } from 'types';

import { HelmetMiddleware } from '@nest-middlewares/helmet';
import { MorganMiddleware } from '@nest-middlewares/morgan';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: (process.env.DB_TYPE as ValidDBType) as any,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      entities: ['/dist/**/*.entity.{ts,js}','/entities/**/*.entity.{ts,js}'], // Array of entities to load(), les classes qui representent les tables de la base de données, dans notre configuration on dit que: on charge tous les fichiers .entity.ts ou .entity.js qui se trouvent dans le dossier dist ou entities et on les considere comme nos entities ou classes qui représentent les tables de la base de données
      synchronize: process.env.NODE_ENV === 'development' // For development only, not for production, permet que toute modification sur les models(Au niveau des entites TypeORM) soit directement répercutée sur la base de données.
    })
  ],
  controllers: [AppController],
  providers: [AppService],

})export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {

    MorganMiddleware.configure('dev')
    consumer.apply( HelmetMiddleware,MorganMiddleware).forRoutes('*');
  }
}
