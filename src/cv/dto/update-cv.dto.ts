import { PartialType } from '@nestjs/mapped-types';

import { AddCvDTO } from './add-cv.dto';

export class UpdateCvDTO extends PartialType(AddCvDTO){
}
