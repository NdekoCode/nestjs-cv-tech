import { Controller, Get } from '@nestjs/common';

import { CvService } from './cv.service';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}
  @Get()
  getCvs() {
    return this.cvService.getCvs();
  }
}
