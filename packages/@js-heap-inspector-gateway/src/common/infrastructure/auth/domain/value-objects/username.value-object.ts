import {
  Column,
  Entity,
} from 'typeorm';

/**
 * Represents a username value object.
 *
 * @property {string} value - The username value.
 */
export class Username {
  @Column()
    value: string;

  /**
   * Validates the username.
   *
   * @param {string} username - The username to validate.
   * @throws {Error} If the username is invalid.
   */
  private validate(username: string): void {
    if (username.length < 8 || username.length > 32) {
      throw new Error('Username must be between 8 and 32 characters long.');
    }

    if (!/^[a-zA-Z\d]+$/.test(username)) {
      throw new Error('Username can only contain alphanumeric characters.');
    }
  }

  /**
   * Returns the username value.
   *
   * @return {string} The username value.
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Creates a new Username instance.
   *
   * @param {string} value - The username value.
   * @return {Username} A new Username instance.
   */
  public static create(value: string): Username {
    const user = new Username();
    user.value = value;
    user.validate(value);

    return user;
  }
}
