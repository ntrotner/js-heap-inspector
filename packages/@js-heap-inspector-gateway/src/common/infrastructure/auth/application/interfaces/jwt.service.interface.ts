/**
 * JWT payload.
 */
export type JwtPayload = {
  user: {
    id: string;
    username: string;
  };
  roles: string[];
  createdAt: number;
};

/**
 * Abstract class for the JWT service.
 */
export abstract class JwtServiceInterface<P = JwtPayload> {
  /**
   * Generates a JWT token.
   *
   * @param payload - The payload to encode in the token.
   * @return {Promise<string>} A promise that resolves to the generated token.
   */
  abstract generateToken(payload: P): Promise<string>;

  /**
   * Validates a JWT token.
   *
   * @param {string} token - The token to validate.
   * @return {Promise<P | undefined>} A promise that resolves to the decoded token.
   */
  abstract validateToken(token: string): Promise<P | undefined>;
}
