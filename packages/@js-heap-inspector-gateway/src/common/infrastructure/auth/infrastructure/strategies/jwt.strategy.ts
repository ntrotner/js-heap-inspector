import {
  Injectable,
} from '@nestjs/common';
import {
  PassportStrategy,
} from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';
import {
  UserRepository,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/domain';
import {
  JwtPayload,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/application';

/**
 * JWT strategy for authentication.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * Validates the user from the JWT payload.
   *
   * @param {any} payload - The JWT payload.
   * @return {Promise<JwtPayload | undefined>} A promise that resolves to the user.
   */
  async validate(payload: {id: string}): Promise<JwtPayload | undefined> {
    const user = await this.userRepository.findById(payload.id);
    if (!user) {
      return;
    }

    return {
      user: {
        id: user.id,
        username: user.username.getValue(),
      },
      roles: user.roles.map(role => role.name),
      createdAt: user.createdAt.getTime(),
    };
  }
}
