import {
  Injectable,
} from '@nestjs/common';
import {
  AuthRepository,
  User,
  UserRepository,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/domain';
import {
  PasswordServiceInterface,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/application';

/**
 * TypeORM implementation of the Auth repository.
 */
@Injectable()
export class TypeOrmAuthRepository implements AuthRepository {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordServiceInterface,
  ) {}

  /**
   * Validates a user.
   *
   * @param {string} username - The username to validate.
   * @param {string} password - The password to validate.
   * @return {Promise<User | undefined>} A promise that resolves to the user or undefined.
   */
  public async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials.');
    }

    const isPasswordValid = await this.passwordService.compare(
      password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials.');
    }

    return user;
  }
}
