import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  async signUpUser(userData: CreateUserDto): Promise<Partial<UserEntity>> {
    if (!userData.username || !userData.email || !userData.password) {
      throw new BadRequestException('Email, username or password invalid');
    }

    let checkIfUserExist = false;
    checkIfUserExist = !!(await this.userRepository.findOne({
      where: { email: userData.email },
    }));

    if (checkIfUserExist) {
      throw new ConflictException({
        statusCode: 409,
        message: 'User already exist',
      });
    }
    try {
      const user = this.userRepository.create(userData);
      user.salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(user.password, user.salt);
      const createdUser = await this.userRepository.save(user);
      delete createdUser.salt;
      delete createdUser.password;
      return createdUser;
    } catch (error) {
      throw new BadRequestException(
        'An error occurred when trying to register the user',
      );
    }
  }
}
