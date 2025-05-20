import { UserEntity } from '@/src/user/entities/user.entity';
import { EUserRoles } from '@/types/enums/user-role.enum';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserChecking {
  isOwn(user: UserEntity, data: { user: UserEntity }) {
    console.log(user?.email, data?.user?.email);
    return (
      (user?.email === data?.user?.email ||
        user?.username === data?.user?.username) &&
      user?.id === data?.user?.id
    );
  }
  IsAdmin(role: EUserRoles) {
    console.log('USER ROLE', role, EUserRoles.ADMIN, role === EUserRoles.ADMIN);
    return role === EUserRoles.ADMIN;
  }
  isOwnerOrAdmin(user: UserEntity, data: { user: UserEntity }) {
    return this.isOwn(user, data) || this.IsAdmin(user?.role);
  }
}
