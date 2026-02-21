/**
 * Represents a password value object.
 *
 * @property {string} hash - The hashed password.
 */
export class Password {
  private readonly hash: string;

  /**
   * Creates a new Password instance.
   *
   * @param {string} hash - The hashed password.
   */
  constructor(hash: string) {
    this.hash = hash;
  }

  /**
   * Returns the password hash.
   *
   * @return {string} The password hash.
   */
  getHash(): string {
    return this.hash;
  }

  /**
   * Creates a new Password instance from plain text.
   *
   * @param {string} plainText - The plain text password.
   * @param {string} hashedPassword - The hashed password.
   * @return {Password} A new Password instance.
   */
  static createFromPlainText(plainText: string, hashedPassword: string): Password {
    return new Password(hashedPassword);
  }
}
