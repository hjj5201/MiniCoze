import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../shared/types/current-user.type';

interface AuthenticatedRequest extends Request {
  user: CurrentUser;
}

export const CurrentUserInfo = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
