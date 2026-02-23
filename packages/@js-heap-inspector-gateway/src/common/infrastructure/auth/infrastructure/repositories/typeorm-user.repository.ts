import {
  InjectRepository,
} from '@nestjs/typeorm';
import {
  Repository,
} from 'typeorm';
import {
  Role,
  User,
  Username,
  UserRepository,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/domain';

/**
 * TypeORM implementation of the User repository.
 */
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Finds a user by username.
   *
   * @param {string} username - The username to search for.
   * @return {Promise<User | null>} A promise that resolves to the user or null.
   */
  public async findByUsername(username: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: {username: Username.create(username)},
      relations: ['roles'],
    });
    return user ?? undefined;
  }

  /**
   * Finds a user by ID.
   *
   * @param {string} id - The user ID to search for.
   * @return {Promise<User | undefined>} A promise that resolves to the user or null.
   */
  public async findById(id: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: {id},
      relations: ['roles'],
    });
    return user ?? undefined;
  }

  /**
   * Saves a user.
   *
   * @param {User} user - The user to save.
   * @return {Promise<User>} A promise that resolves to the saved user.
   */
  public async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  /**
   * Assigns a role to a user.
   *
   * @param {string} userId - The user ID.
   * @param {string} roleId - The role ID to assign.
   * @return {Promise<void>} A promise that resolves when the role is assigned.
   */
  public async assignRole(userId: string, roleId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const role = await this.roleRepository.findOne({where: {id: roleId}});
    if (!role) {
      throw new Error('Role not found.');
    }

    user.addRole(role);
    await this.save(user);
  }
}
