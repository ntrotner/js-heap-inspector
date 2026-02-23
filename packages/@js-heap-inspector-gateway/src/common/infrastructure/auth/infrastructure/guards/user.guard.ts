import {
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import {
  Reflector,
} from '@nestjs/core';
import {
  AuthGuard,
} from '@nestjs/passport';

/**
 * Guard for ensuring user authentication.
 */
@Injectable()
export class UserGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Handles the request and checks for authentication.
   *
   * @param {ExecutionContext} context - The execution context.
   * @return {Promise<boolean>} A promise that resolves to the user or null.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = await super.canActivate(context);
    if (!canActivate) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const {user} = request;

    return user !== undefined && user !== null;
  }
}
