import { Body, Controller, Get, Post } from '@nestjs/common';

import { CvService } from './cv.service';
import { AddCvDTO } from './dto/cv.dto';
import { CvEntity } from './entities/cv.entity';

@Controller('cv')
export class CvController {
  
  constructor(private readonly cvService: CvService) {}

  @Get()
  async getCvs(): Promise<CvEntity[]> {
    return await this.cvService.getCvs();
  }

  @Post()
  async addCv(@Body() cv: AddCvDTO):Promise<CvEntity> {
    return await this.cvService.addCv(cv);
  }
}
