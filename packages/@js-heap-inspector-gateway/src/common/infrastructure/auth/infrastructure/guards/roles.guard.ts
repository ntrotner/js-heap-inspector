import {
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import {
  AuthGuard,
} from '@nestjs/passport';

/**
 * Creates a guard that checks for required roles.
 */
function createRolesGuard(requiredRoles?: string | string[]): CanActivate {
  class MixinRolesGuard extends AuthGuard('jwt') {
    constructor() {
      super();
    }

    /**
     * Handles the request and checks for required roles.
     *
     * @param {ExecutionContext} context - The execution context.
     * @return {Promise<boolean>} A promise that resolves to true if the user has the required roles, false otherwise.
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const canActivate = await super.canActivate(context);
      if (!canActivate) {
        return false;
      }

      const request = context.switchToHttp().getRequest();
      const {user} = request;
      const userRoles = user.roles || [];
      return (Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]).some(role => userRoles.includes(role));
    }
  }

  return new MixinRolesGuard();
}

export const RolesGuard: (type?: string | string[]) => CanActivate = createRolesGuard;
