import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { UserEntity } from '@/src/user/entities/user.entity';
import { IUserPayload } from '@/types/interfaces/user.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';

// Il faudra mettre cette classe `JwtStrategy` dans auth.module.ts et dans la section `providers`
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('SECRET'),
    });
  }

  // Cette fonctionnalité nous permet de dire: A CHAQUE FOIS QUE LA REQUÊTE VIENT, voila comment tu vas valider mon token

  async validate(payload: IUserPayload) {
    // on va mettre le user dans la requête pour pouvoir le récupère n'importe quand
    const qb = this.userRepository.createQueryBuilder('users');
    const username = payload?.username || payload?.email;
    const user = await qb
      .where('users.email =:username OR users.username = :username', {
        username,
      })
      .getOne();

    // Si le user existe je le retourne et automatiquement ce que je retourne dans validate est mis dans le request
    // Si non je renvois une erreur
    if (user) {
      delete user.password;
      delete user.salt;
      // Nous permettra d'avoir un objet `user` dans la requete utilisateur un peu comme `req.user`
      return user;
    }
    throw new UnauthorizedException('User not allowed');
  }
}
