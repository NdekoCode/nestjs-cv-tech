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
      type:'postgres',
      host:process.env.DB_HOST,
      database:process.env.DB_NAME,
      port:parseInt(process.env.DB_PORT),
      username:process.env.DB_USERNAME,
      password:process.env.DB_PASSWORD,
      entities:[], // Array of entities to load
      synchronize:process.env.NODE_ENV==='development' // For development only, not for production, permet que toute modification sur les models(Au niveau des entites TypeORM) soit directement répercutée sur la base de données.
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {

    MorganMiddleware.configure('dev')
    consumer.apply( HelmetMiddleware,MorganMiddleware).forRoutes('*');
  }
}
