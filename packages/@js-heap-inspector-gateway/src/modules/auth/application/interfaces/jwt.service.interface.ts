/**
 * Interface for the JWT service.
 *
 * @interface JwtServiceInterface
 */
export abstract class JwtServiceInterface {
  /**
   * Generates a JWT token.
   *
   * @param {string} payload - The payload to encode in the token.
   * @return {Promise<string>} A promise that resolves to the generated token.
   */
  abstract generateToken(payload: string): Promise<string>;

  /**
   * Validates a JWT token.
   *
   * @param {string} token - The token to validate.
   * @return {Promise<any>} A promise that resolves to the decoded token.
   */
  abstract validateToken(token: string): Promise<any>;
}
