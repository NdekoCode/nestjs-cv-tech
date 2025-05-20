import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { CvService } from './cv.service';
import { AddCvDTO } from './dto/add-cv.dto';
import { UpdateCvDTO } from './dto/update-cv.dto';
import { CvEntity } from './entities/cv.entity';

/**
 * The CvController class provides a set of API endpoints for managing CVs (Curriculum Vitae) in the application.
 *
 * @export
 * @class CvController
 */
@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  /**
   * Retrieves all CVs.
   *
   * @returns {Promise<CvEntity[]>} An array of CvEntity objects representing the CVs.
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getCvs(@User() user: UserEntity): Promise<CvEntity[]> {
    return await this.cvService.getCvs(user);
  }

  /**
   * Adds a new CV.
   *
   * @param {AddCvDTO} cv The CV data to add.
   * @returns {Promise<CvEntity>} The CvEntity object representing the newly added CV.
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async addCv(
    @Body() cv: AddCvDTO,
    @User() user: UserEntity,
  ): Promise<CvEntity> {
    return await this.cvService.addCv(cv, user);
  }

  @Get('stats/:max/:min')
  async getStatsCvNumberByAge(
    @Param('min', ParseIntPipe) min: number = 0,
    @Param('max', ParseIntPipe) max: number = 100,
    @User() user: UserEntity,
  ): Promise<CvEntity[]> {
    return this.cvService.statsCvNumberByAge(max, min, user);
  }
  /**
   * Retrieves a single CV by its ID.
   *
   * @param {number} id The ID of the CV to retrieve.
   * @returns {Promise<CvEntity>} The CvEntity object representing the requested CV.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getSingleCv(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserEntity,
  ): Promise<CvEntity> {
    return await this.cvService.getSingleCv(id, user);
  }

  /**
   * Updates an existing CV.
   *
   * @param {UpdateCvDTO} cv The updated CV data.
   * @param {number} id The ID of the CV to update.
   * @returns {Promise<CvEntity>} The CvEntity object representing the updated CV.
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id') // Va juste modifier une partie d'une entité   alors que PUT modifie toute l'entité
  async updateCv(
    @Body() cv: UpdateCvDTO,
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserEntity,
  ): Promise<CvEntity> {
    return this.cvService.updateCv(id, cv, user);
  }

  /**
   * Removes a CV by its ID.
   *
   * @param {number} id The ID of the CV to remove.
   * @returns {Promise<void>} A promise that resolves when the CV is removed.
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeCv(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserEntity,
  ) {
    return await this.cvService.removeCv(id, user);
  }

  /**
   * Soft-removes a CV by its ID.
   *
   * @param {number} id The ID of the CV to soft-remove.
   * @returns {Promise<CvEntity>} The CvEntity object representing the soft-removed CV.
   */
  @UseGuards(JwtAuthGuard)
  @Delete('/soft-delete/:id')
  async softRemoveCv(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserEntity,
  ): Promise<CvEntity> {
    return this.cvService.softRemoveCv(id, user);
  }

  /**
   * Recovers a soft-removed CV by its ID.
   *
   * @param {number} id The ID of the CV to recover.
   * @returns {Promise<void>} A promise that resolves when the CV is recovered.
   */
  @Get('/recover/:id')
  @UseGuards(JwtAuthGuard)
  async recoverCv(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserEntity,
  ) {
    return await this.cvService.recoverCv(id, user);
  }
}
