import { Repository } from 'typeorm';

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserEntity } from '../user/entities/user.entity';
import { UserChecking } from '../user/user-checking.service';
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
    private readonly userChecking: UserChecking,
  ) {}

  /**
   * Retrieves all the CV entities from the database.
   * @returns A promise that resolves to an array of CV entities.
   *
   */
  async getCvs(user: UserEntity): Promise<CvEntity[]> {
    if (!this.userChecking.IsAdmin(user.role)) {
      // Je veux avoir une promesse d'avoir des CV-Entity
      return await this.cvRepository.find({
        where: {
          user: {
            email: user.email,
          },
        },
        relations: ['user'],
      });
    }
    return this.cvRepository.find();
  }
  /**
   * Retrieves a single CV entity from the database by its ID.
   * @param id - The ID of the CV to retrieve.
   * @returns A promise that resolves to the CV entity with the specified ID.
   * @throws NotFoundException if the CV with the given ID is not found.
   */
  async getSingleCv(id: number, user: UserEntity): Promise<CvEntity> {
    const cv = await this.cvRepository.findOne({ where: { id } });
    if (!cv) {
      throw new NotFoundException(`Cv with ID: ${id} is not found`);
    }
    if (!this.userChecking.isOwnerOrAdmin(user, cv)) {
      throw new UnauthorizedException(
        'You are not allowed to access to this ressource',
      );
    }

    return cv;
  }

  /**
   * Adds a new CV to the database.
   * @param cv The DTO (Data Transfer Object) containing the data for the new CV.
   */
  async addCv(cv: AddCvDTO, user: UserEntity): Promise<CvEntity> {
    // Implementation for adding a new CV
    const newCv = this.cvRepository.create(cv);
    newCv.user = user;
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
  async updateCv(
    id: number,
    cv: Partial<UpdateCvDTO>,
    user: UserEntity,
  ): Promise<CvEntity> {
    const findCv = await this.cvRepository.preload({
      id,
      ...cv,
    });
    if (!findCv) {
      throw new NotFoundException(`Cv with ID: ${id} is not found`);
    }
    if (
      !this.userChecking.isOwn(user, findCv) &&
      !this.userChecking.IsAdmin(user.role)
    ) {
      throw new UnauthorizedException(
        'You are not allowed to access to this ressource',
      );
    }
    const updateCV = { findCv, ...cv };
    return await this.cvRepository.save(updateCV); // On enregistre les nouvelles donnees du CV, typeORM va se charger de faire l'UPDATE
  }

  /**
   * Permanently removes a CV from the database.
   * @param id - The ID of the CV to be removed.
   * @returns A promise that resolves to the removed CV entity.
   * @throws NotFoundException if the CV with the given ID is not found.
   */
  async removeCv(id: number, user: UserEntity) {
    const cvToRemove = await this.getSingleCv(id, user);
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
  async softRemoveCv(id: number, user: UserEntity) {
    const cvToRemove = await this.getSingleCv(id, user);
    if (!cvToRemove) {
      throw new NotFoundException(`Cv with ID: ${id} is not found`);
    }

    if (!this.userChecking.IsAdmin(user.role)) {
      throw new UnauthorizedException(
        'You are not allowed to access to this ressource',
      );
    }
    return await this.cvRepository.softRemove(cvToRemove);
  }

  /**
   * Soft removes a CV from the database.
   * @param id - The ID of the CV to be soft removed.
   * @returns A promise that resolves to the soft removed CV entity.
   * @throws NotFoundException if the CV with the given ID is not found.
   */
  async deleteCv(id: number, user: UserEntity) {
    if (!this.userChecking.isOwnerOrAdmin(user, { user })) {
      throw new UnauthorizedException(
        'You are not allowed to access to this ressource',
      );
    }
    return await this.cvRepository.softDelete(id);
  }
  /**
   * Restores a previously soft-deleted CV from the database.
   * @param id - The ID of the CV to be restored.
   * @returns A promise that resolves to the restored CV entity.
   * @throws NotFoundException if the CV with the given ID is not found.
   */
  async restoreCv(id: number, user: UserEntity) {
    if (!this.userChecking.IsAdmin(user.role)) {
      throw new UnauthorizedException(
        'You are not allowed to access to this ressource',
      );
    }
    // `restore` n'a pas besoin d'aller chercher une entité spécifique, il va le trouver lui meme par son id ou l'option `where:{}` et le restorer
    return await this.cvRepository.restore(id);
  }
  /**
   * Restores a previously soft-deleted CV from the database.
   * @param id - The ID of the CV to be restored.
   * @returns A promise that resolves to the restored CV entity.
   * @throws NotFoundException if the CV with the given ID is not found.
   */
  async recoverCv(id: number, user: UserEntity) {
    const cvToRecover = await this.cvRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!cvToRecover) {
      throw new NotFoundException(`Cv with ID: ${id} is not found`);
    }

    if (!this.userChecking.IsAdmin(user.role)) {
      throw new UnauthorizedException(
        'You are not allowed to access to this ressource',
      );
    }
    return await this.cvRepository.recover(cvToRecover);
  }

  /**
   * Retrieves the number of CVs grouped by age.
   * @returns A promise that resolves to an array of objects containing the age and the count of CVs for that age.
   */
  async statsCvNumberByAge(
    maxAge: number,
    minAge: number = 0,
    user: UserEntity,
  ) {
    if (!this.userChecking.IsAdmin(user.role)) {
      throw new UnauthorizedException(
        'You are not allowed to access to this ressource',
      );
    }
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
