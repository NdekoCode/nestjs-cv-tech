import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from '../auth/auth.service';
import { CvService } from '../cv/cv.service';
import { CvEntity } from '../cv/entities/cv.entity';
import { UserEntity } from '../user/entities/user.entity';
import { UserChecking } from '../user/user-checking.service';
import { SeedController } from './seed.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CvEntity, UserEntity])],
  controllers: [SeedController],
  providers: [AuthService, CvService, UserChecking],
})
export class SeedModule {}
