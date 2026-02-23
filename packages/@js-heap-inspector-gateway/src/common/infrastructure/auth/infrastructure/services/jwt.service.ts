import {
  Injectable,
} from '@nestjs/common';
import {
  JwtService as NestJwtService,
} from '@nestjs/jwt';
import {
  JwtPayload,
  JwtServiceInterface,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/application';

/**
 * JWT service implementation.
 */
@Injectable()
export class JwtService implements JwtServiceInterface {
  constructor(private readonly jwtService: NestJwtService) {}

  /**
   * Generates a JWT token.
   *
   * @param {string} payload - The payload to encode in the token.
   * @return {Promise<string>} A promise that resolves to the generated token.
   */
  public async generateToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.sign(payload);
  }

  /**
   * Validates a JWT token.
   *
   * @param {string} token - The token to validate.
   * @return {Promise<any>} A promise that resolves to the decoded token.
   */
  public async validateToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verify(token);
  }
}
