import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserEntity } from '../user/entities/user.entity';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
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
      throw new UnauthorizedException('email, username or password invalid');
    }

    const hashPassword = await bcrypt.hash(password, user.salt);
    // Si oui verifie est-ce que le mot de passe est correct ou pas ?
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch && hashPassword === user.password) {
      const payload = {
        ...(user.username && { username: user.username }),
        email: user.email,
        role: user.role,
      };
      const access_token = await this.jwtService.signAsync(payload);
      return {
        message: 'You are authenticated',
        user: payload,
        access_token,
      };
    }

    // Sinon je denclenche une erreur
    throw new UnauthorizedException('email, username or password invalid');
  }
}
