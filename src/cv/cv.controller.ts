import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { CvService } from './cv.service';
import { AddCvDTO } from './dto/add-cv.dto';
import { UpdateCvDTO } from './dto/update-cv.dto';
import { CvEntity } from './entities/cv.entity';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Get()
  async getCvs(): Promise<CvEntity[]> {
    return await this.cvService.getCvs();
  }

  @Get(':id')
  async getSingleCv(@Param('id', ParseIntPipe) id: number): Promise<CvEntity> {
    return await this.cvService.getSingleCv(id);
  }

  @Post()
  async addCv(@Body() cv: AddCvDTO): Promise<CvEntity> {
    return await this.cvService.addCv(cv);
  }

  @Patch(':id') // Va juste modifier une partie d'une entité   alors que PUT modifie toute l'entité
  async updateCv(
    @Body() cv: UpdateCvDTO,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CvEntity> {
    return this.cvService.updateCv(id, cv);
  }

  @Delete(':id')
  async removeCv(@Param('id', ParseIntPipe) id: number) {
    return await this.cvService.removeCv(id);
  }

  @Delete('/soft-delete/:id')
  async softRemoveCv(@Param('id', ParseIntPipe) id: number): Promise<CvEntity> {
    return this.cvService.softRemoveCv(id);
  }
}
