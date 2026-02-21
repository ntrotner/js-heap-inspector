import {
  Injectable,
} from '@nestjs/common';
import {
  JwtService as NestJwtService,
} from '@nestjs/jwt';
import {
  JwtServiceInterface,
} from '../../application/interfaces/jwt.service.interface';

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
  async generateToken(payload: string): Promise<string> {
    return this.jwtService.sign(payload);
  }

  /**
   * Validates a JWT token.
   *
   * @param {string} token - The token to validate.
   * @return {Promise<any>} A promise that resolves to the decoded token.
   */
  async validateToken(token: string): Promise<any> {
    return this.jwtService.verify(token);
  }
}
