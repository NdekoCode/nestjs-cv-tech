import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CvEntity } from './entities/cv.entity';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(CvEntity) private readonly cvRepository: Repository<CvEntity>,
  ) {}

  // Je veux avoir une promesse d'avoir des CV-Entity
  async getCvs():Promise<CvEntity[]>{
    return await this.cvRepository.find()
  }
}
