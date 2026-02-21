import {
  type User,
} from '../entities/user.entity';

/**
 * Interface for the Auth repository.
 *
 * @interface AuthRepository
 */
export abstract class AuthRepository {
  /**
   * Validates a user.
   *
   * @param {string} username - The username to validate.
   * @param {string} password - The password to validate.
   * @return {Promise<User | null>} A promise that resolves to the user or null.
   */
  abstract validateUser(username: string, password: string): Promise<User | undefined>;
}
