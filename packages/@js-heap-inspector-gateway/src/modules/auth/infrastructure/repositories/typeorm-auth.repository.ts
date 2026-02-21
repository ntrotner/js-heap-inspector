import {
  Injectable,
} from '@nestjs/common';
import {
  AuthRepository,
} from '../../domain/repositories/auth.repository.interface';
import {
  UserRepository,
} from '../../domain/repositories/user.repository.interface';
import {
  PasswordServiceInterface,
} from '../../application/interfaces/password.service.interface';
import {
  User,
} from '../../domain/entities/user.entity';

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
   * @return {Promise<User | null>} A promise that resolves to the user or null.
   */
  async validateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      return;
    }

    const isPasswordValid = await this.passwordService.compare(
      password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      return;
    }

    return user;
  }
}
