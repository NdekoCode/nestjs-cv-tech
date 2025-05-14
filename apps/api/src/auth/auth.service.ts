import { Injectable } from '@nestjs/common';

import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}
  async signUpUser(userData: CreateUserDto) {
    return await this.userService.create(userData);
  }
}
