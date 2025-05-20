import { Injectable } from '@nestjs/common';

import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserChecking {
  isOwn(user: UserEntity, data: { user: UserEntity }) {
    return (
      user.email === data.user.email || user.username === data.user.username
    );
  }
}
