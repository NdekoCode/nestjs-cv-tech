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

  /**
   * Retrieves a single CV entity from the database by its ID.
   * @param id - The ID of the CV to retrieve.
   * @returns A promise that resolves to the CV entity with the specified ID.
   * @throws NotFoundException if the CV with the given ID is not found.
   */
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

  /**
   * Updates an existing CV in the database.
   * @param id - The ID of the CV to be updated.
   * @param cv - The partial DTO containing the updated data for the CV.
   * @returns A promise that resolves to the updated CV entity.
   * @throws NotFoundException if the CV with the given ID is not found.
   */
  /**
   * Updates an existing CV in the database.
   * @param id - The ID of the CV to be updated.
   * @param cv - The partial DTO containing the updated data for the CV.
   * @returns A promise that resolves to the updated CV entity.
   * @throws NotFoundException if the CV with the given ID is not found.
   */
  async updateCv(id: number, cv: Partial<UpdateCvDTO>): Promise<CvEntity> {
    /* const findCv = await this.cvRepository.preload({
      id,
      ...cv,
    }); */ // Il va aller chercher l'objet qui a cet ID, et il va précharger cet objet et il va remplacer les anciennes valeur de cette objet par les nouvelles valeurs dans `cv`
    const findCv = await this.getSingleCv(id);
    if (!findCv) {
      throw new NotFoundException(`Cv with ID: ${id} is not found`);
    }
    const updateCV = {findCv,...cv}
    return await this.cvRepository.save(updateCV); // On enregistre les nouvelles donnees du CV, typeORM va se charger de faire l'UPDATE
  }

  /**
   * Permanently removes a CV from the database.
   * @param id - The ID of the CV to be removed.
   * @returns A promise that resolves to the removed CV entity.
   * @throws NotFoundException if the CV with the given ID is not found.
   */
  async removeCv(id: number) {
    const cvToRemove = await this.getSingleCv(id);
    if (!cvToRemove) {
      throw new NotFoundException(`Cv with ID: ${id} is not found`);
    }
    return await this.cvRepository.remove(cvToRemove); // On supprime définitivement un element
  }

  /**
   * Soft removes a CV from the database.
   * @param id - The ID of the CV to be soft removed.
   * @returns A promise that resolves to the soft removed CV entity.
   * @throws NotFoundException if the CV with the given ID is not found.
   */
  async softRemoveCv(id: number) {
    const cvToRemove = await this.getSingleCv(id);
    if (!cvToRemove) {
      throw new NotFoundException(`Cv with ID: ${id} is not found`);
    }
    return await this.cvRepository.softRemove(cvToRemove);
  }

  /**
   * Soft removes a CV from the database.
   * @param id - The ID of the CV to be soft removed.
   * @returns A promise that resolves to the soft removed CV entity.
   * @throws NotFoundException if the CV with the given ID is not found.
   */
  async deleteCv(id: number) {
    return await this.cvRepository.softDelete(id);
  }
  /**
   * Restores a previously soft-deleted CV from the database.
   * @param id - The ID of the CV to be restored.
   * @returns A promise that resolves to the restored CV entity.
   * @throws NotFoundException if the CV with the given ID is not found.
   */
  async restoreCv(id: number) {
    // `restore` n'a pas besoin d'aller chercher une entité spécifique, il va le trouver lui meme par son id ou l'option `where:{}` et le restorer
    return await this.cvRepository.restore(id);
  }
  /**
   * Restores a previously soft-deleted CV from the database.
   * @param id - The ID of the CV to be restored.
   * @returns A promise that resolves to the restored CV entity.
   * @throws NotFoundException if the CV with the given ID is not found.
   */
  async recoverCv(id: number) {
    const cvToRecover = await this.cvRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!cvToRecover) {
      throw new NotFoundException(`Cv with ID: ${id} is not found`);
    }
    return await this.cvRepository.recover(cvToRecover);
  }

  /**
   * Retrieves the number of CVs grouped by age.
   * @returns A promise that resolves to an array of objects containing the age and the count of CVs for that age.
   */
  async statsCvNumberByAge(maxAge: number, minAge: number = 0) {
    // On créer notre Query Builder
    const qb = this.cvRepository.createQueryBuilder('cv'); // L'Alias c'est le nom que vous avez ou allez donner à votre entité pour que lorsque vous créer vos requêtes que vous puissiez référencer la table sur laquelle vous travailler.
    qb.select('cv.age, count(cv.id) as NUMBER_OF_CV')
      .groupBy('cv.age')
      .where('cv.age > :minAge AND cv.age < :maxAge')
      .setParameters({ maxAge, minAge });
    console.log(qb.getSql());
    return await qb.getRawMany();
  }
}
