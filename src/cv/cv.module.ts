import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { CvEntity } from './entities/cv.entity';

@Module({
  imports:[TypeOrmModule.forFeature([CvEntity])],
  controllers: [CvController],
  providers: [CvService]
})
export class CvModule {}
