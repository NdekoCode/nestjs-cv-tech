import { Repository } from 'typeorm';

import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserChecking } from './user-checking.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userChecking: UserChecking,
  ) {}
  async create(createUserDto: CreateUserDto) {
    let checkIfUserExist = false;
    if (createUserDto.email) {
      checkIfUserExist = !!(await this.userRepository.findOne({
        where: { email: createUserDto.email },
      }));
    }
    if (checkIfUserExist) {
      throw new ConflictException({
        statusCode: 409,
        message: 'User already exist',
      });
    }
    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }

  async findAll(user: UserEntity) {
    if (!this.userChecking.IsAdmin(user.role)) {
      throw new UnauthorizedException(
        'You are not allowed to access to this ressource',
      );
    }
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    if (!id) {
      throw new ConflictException('Provide a valid User ID');
    }
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ${id} is not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (
      !this.userChecking.isOwn(user, { user }) ||
      !this.userChecking.IsAdmin(user.role)
    ) {
      throw new UnauthorizedException(
        'You are not allowed to access to this ressource',
      );
    }
    const checkUser = await this.userRepository.preload(user);
    const updatedUser = { ...checkUser, updateUserDto };
    return await this.userRepository.save(updatedUser);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    if (
      !this.userChecking.isOwn(user, { user }) ||
      !this.userChecking.IsAdmin(user.role)
    ) {
      throw new UnauthorizedException(
        'You are not allowed to access to this ressource',
      );
    }
    return await this.userRepository.remove(user);
  }
}
