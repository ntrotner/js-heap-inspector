import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  User,
} from './user.entity';

/**
 * Represents a role in the system.
 */
@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
    id: string;

  @Column()
    name: string;

  @Column('simple-array')
    permissions: string[];

  @ManyToOne(() => User, user => user.roles, {onDelete: 'CASCADE'})
    user: string;

  /**
   * Creates a new Role instance.
   *
   * @param {Object} properties - Role properties.
   */
  public static create(properties: {id: string; name: string; permissions: string[]}) {
    const role = new Role();
    role.id = properties.id;
    role.name = properties.name;
    role.permissions = properties.permissions;

    return role;
  }
}
