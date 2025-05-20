import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from '../auth/auth.service';
import { CvService } from '../cv/cv.service';
import { CvEntity } from '../cv/entities/cv.entity';
import { UserEntity } from '../user/entities/user.entity';
import { SeedController } from './seed.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CvEntity, UserEntity])],
  controllers: [SeedController],
  providers: [AuthService, CvService],
})
export class SeedModule {}
