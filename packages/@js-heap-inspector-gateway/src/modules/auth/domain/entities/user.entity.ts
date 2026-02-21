import {
  type Username,
} from '../value-objects/username.value-object';
import {
  type Role,
} from './role.entity';

/**
 * Represents a user in the system.
 *
 * @property {string} id - Unique identifier for the user.
 * @property {Username} username - The user's username (value object).
 * @property {string} passwordHash - Hashed password for the user.
 * @property {Role[]} roles - Roles assigned to the user.
 * @property {Date} createdAt - Timestamp when the user was created.
 * @property {Date} updatedAt - Timestamp when the user was last updated.
 */
export class User {
  id: string;
  username: Username;
  passwordHash: string;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;

  /**
   * Creates a new User instance.
   *
   * @param {Object} properties - User properties.
   * @param {string} properties.id - Unique identifier.
   * @param {Username} properties.username - Username value object.
   * @param {string} properties.passwordHash - Hashed password.
   * @param {Role[]} properties.roles - Array of roles.
   * @param {Date} properties.createdAt - Creation timestamp.
   * @param {Date} properties.updatedAt - Update timestamp.
   */
  constructor(properties: {
    id: string;
    username: Username;
    passwordHash: string;
    roles: Role[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = properties.id;
    this.username = properties.username;
    this.passwordHash = properties.passwordHash;
    this.roles = properties.roles;
    this.createdAt = properties.createdAt;
    this.updatedAt = properties.updatedAt;
  }

  /**
   * Adds a role to the user.
   *
   * @param {Role} role - The role to add.
   */
  addRole(role: Role): void {
    if (!this.roles.includes(role)) {
      this.roles.push(role);
      this.updatedAt = new Date();
    }
  }

  /**
   * Checks if the user has a specific role.
   *
   * @param {Role} role - The role to check.
   * @return {boolean} True if the user has the role, false otherwise.
   */
  hasRole(role: Role): boolean {
    return this.roles.some(r => r.id === role.id);
  }
}
