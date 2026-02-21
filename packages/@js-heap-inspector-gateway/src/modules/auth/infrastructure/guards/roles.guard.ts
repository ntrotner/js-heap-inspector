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
 * Roles guard for role-based access control.
 */
@Injectable()
export class RolesGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Handles the request and checks for required roles.
   *
   * @param {ExecutionContext} context - The execution context.
   * @return {Promise<any>} A promise that resolves to the user or null.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const canActivate = await super.canActivate(context);
    if (!canActivate) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const {user} = request;
    const userRoles = user.roles || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    return hasRequiredRole;
  }
}
