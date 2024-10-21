
import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { AddCvDTO } from './dto/cv.dto';
import { CvEntity } from './entities/cv.entity';

/**
 * Provides a service for managing CVs (Curriculum Vitae) in the application.
 */

@Injectable()
export class CvService {
  constructor(
    /**
     * The repository for accessing and manipulating CV entities.
     */
    @InjectRepository(CvEntity)
    private readonly cvRepository: Repository<CvEntity>
  ) {}

  /**
   * Retrieves all the CV entities from the database.
   * @returns A promise that resolves to an array of CV entities.
   * 
   */
  async getCvs(): Promise<CvEntity[]> { // Je veux avoir une promesse d'avoir des CV-Entity
    return await this.cvRepository.find();
  }

  /**
   * Adds a new CV to the database.
   * @param cv The DTO (Data Transfer Object) containing the data for the new CV.
   */
  async addCv(cv: AddCvDTO):Promise<CvEntity> {
    // Implementation for adding a new CV
    const newCv = this.cvRepository.create(cv);
    return await this.cvRepository.save(newCv);
  }
}

