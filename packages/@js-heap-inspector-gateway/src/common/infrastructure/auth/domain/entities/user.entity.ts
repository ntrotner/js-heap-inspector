import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  Username,
} from '../value-objects/username.value-object';
import {
  Role,
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
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @Column(() => Username)
    username: Username;

  @Column()
    passwordHash: string;

  @OneToMany(() => Role, role => role.user)
    roles: Role[];

  @CreateDateColumn()
    createdAt: Date;

  @CreateDateColumn()
    updatedAt: Date;

  /**
   * Creates a new User instance.
   *
   * @param {Object} properties - User properties.
   */
  public static create(properties: {
    id: string;
    username?: Username;
    passwordHash?: string;
    roles?: Role[];
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    const user = new User();
    user.id = properties.id;
    user.username = properties.username ?? Username.create('abcdefgahf');
    user.passwordHash = properties.passwordHash ?? '';
    user.roles = properties.roles ?? [];
    user.createdAt = properties.createdAt ?? new Date();
    user.updatedAt = properties.updatedAt ?? new Date();

    return user;
  }

  /**
   * Adds a role to the user.
   *
   * @param {Role} role - The role to add.
   */
  public addRole(role: Role): void {
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
  public hasRole(role: Role): boolean {
    return this.roles.some(r => r.id === role.id);
  }
}
