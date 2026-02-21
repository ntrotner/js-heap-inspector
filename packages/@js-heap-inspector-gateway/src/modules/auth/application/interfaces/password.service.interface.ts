/**
 * Interface for the Password service.
 *
 * @interface PasswordServiceInterface
 */
export abstract class PasswordServiceInterface {
  /**
   * Hashes a password.
   *
   * @param {string} password - The password to hash.
   * @return {Promise<string>} A promise that resolves to the hashed password.
   */
  abstract hash(password: string): Promise<string>;

  /**
   * Compares a password with a hash.
   *
   * @param {string} password - The password to compare.
   * @param {string} hash - The hash to compare against.
   * @return {Promise<boolean>} A promise that resolves to true if the password matches the hash.
   */
  abstract compare(password: string, hash: string): Promise<boolean>;
}
