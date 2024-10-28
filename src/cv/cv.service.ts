import { Repository } from 'typeorm';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { AddCvDTO } from './dto/add-cv.dto';
import { UpdateCvDTO } from './dto/update-cv.dto';
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
    private readonly cvRepository: Repository<CvEntity>,
  ) {}

  /**
   * Retrieves all the CV entities from the database.
   * @returns A promise that resolves to an array of CV entities.
   *
   */
  async getCvs(): Promise<CvEntity[]> {
    // Je veux avoir une promesse d'avoir des CV-Entity
    return await this.cvRepository.find();
  }
  async getSingleCv(id: number): Promise<CvEntity> {
    const cv = await this.cvRepository.findOne({ where: { id } });
    if (!cv) {
      throw new NotFoundException(`Cv with ID: ${id} is not found`);
    }
    return cv;
  }

  /**
   * Adds a new CV to the database.
   * @param cv The DTO (Data Transfer Object) containing the data for the new CV.
   */
  async addCv(cv: AddCvDTO): Promise<CvEntity> {
    // Implementation for adding a new CV
    const newCv = this.cvRepository.create(cv);
    // Va créer un nouvel objet CV en se basant sur les données de la DTO et si elle existe deja dans la BDD, elle va faire un UPDATE
    return await this.cvRepository.save(newCv);
  }
  async updateCv(id: number, cv: Partial<UpdateCvDTO>): Promise<CvEntity> {
    const findCv = await this.cvRepository.preload({
      id,
      ...cv,
    }); // Il va aller chercher l'objet qui a cet ID, et il va précharger cet objet et il va remplacer les anciennes valeur de cette objet par les nouvelles valeurs dans `cv`
    if (!findCv) {
      throw new NotFoundException(`Cv with ID: ${id} is not found`);
    }
    return await this.cvRepository.save(findCv); // On enregistre les nouvelles donnees du CV, typeORM va se charger de faire l'UPDATE
  }
  async removeCv(id: number) {
    const cvToRemove = await this.cvRepository.findOne({ where: { id } });
    if (!cvToRemove) {
      throw new NotFoundException(`Cv with ID: ${id} is not found`);
    }
    return await this.cvRepository.remove(cvToRemove);
  }

  async softRemoveCv(id: number) {
    const cvToRemove = await this.cvRepository.findOne({ where: { id } });
    if (!cvToRemove) {
      throw new NotFoundException(`Cv with ID: ${id} is not found`);
    }
    return await this.cvRepository.softRemove(cvToRemove);
  }
}
