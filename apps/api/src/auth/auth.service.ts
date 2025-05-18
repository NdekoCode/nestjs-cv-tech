import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { LoginDTO } from './dto/login.dto';

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

  async loginUser(loginUserData: LoginDTO) {
    // Recupere le login et le mot de passe
    const { password, username } = loginUserData;
    // On peut se logger via le username ou le email avec le mot de passe

    // Verifier si il y a un user avec ce login ou ce mot de passe
    const qb = this.userRepository.createQueryBuilder('users');
    qb.where('users.email=:username OR users.username=:username')
      .limit(1)
      .setParameters({
        username,
      });
    const user = await qb.getOne();
    if (!user) {
      // Sinon je denclenche une erreur
      throw new NotFoundException('email, username or password invalid');
    }

    console.log(qb.getSql());
    const hashPassword = await bcrypt.hash(password, user.salt);
    // Si oui verifie est-ce que le mot de passe est correct ou pas ?
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch && hashPassword === user.password) {
      delete user.password;
      delete user.salt;
      return {
        message: 'You are authenticated',
        user: user,
      };
    }

    // Sinon je denclenche une erreur
    throw new NotFoundException('email, username or password invalid');
  }
}
