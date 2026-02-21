import {
  SetMetadata,
} from '@nestjs/common';

/**
 * Roles decorator for role-based access control.
 *
 * @param {...string[]} roles - The roles required to access the route.
 * @return {MethodDecorator} A method decorator.
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
