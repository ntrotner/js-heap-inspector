import {
  type User,
} from '../entities/user.entity';

/**
 * Interface for the User repository.
 *
 * @interface UserRepository
 */
export abstract class UserRepository {
  /**
   * Finds a user by username.
   *
   * @param {string} username - The username to search for.
   * @return {Promise<User | null>} A promise that resolves to the user or null.
   */
  abstract findByUsername(username: string): Promise<User | undefined>;

  /**
   * Finds a user by ID.
   *
   * @param {string} id - The user ID to search for.
   * @return {Promise<User | null>} A promise that resolves to the user or null.
   */
  abstract findById(id: string): Promise<User | undefined>;

  /**
   * Saves a user.
   *
   * @param {User} user - The user to save.
   * @return {Promise<User>} A promise that resolves to the saved user.
   */
  abstract save(user: User): Promise<User>;

  /**
   * Assigns a role to a user.
   *
   * @param {string} userId - The user ID.
   * @param {string} roleId - The role ID to assign.
   * @return {Promise<void>} A promise that resolves when the role is assigned.
   */
  abstract assignRole(userId: string, roleId: string): Promise<void>;
}
