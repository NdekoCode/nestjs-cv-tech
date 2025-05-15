import { Body, Controller, Post } from '@nestjs/common';

import { UserEntity } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { SignupDTO } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  async signup(@Body() userData: SignupDTO): Promise<Partial<UserEntity>> {
    return await this.authService.signUpUser(userData);
  }
}
