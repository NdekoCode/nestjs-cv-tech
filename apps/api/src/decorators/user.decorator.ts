import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserEntity } from '../user/entities/user.entity';

// Décorateur recuperable via @User
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as { user: UserEntity };
    return request.user;
  },
);
