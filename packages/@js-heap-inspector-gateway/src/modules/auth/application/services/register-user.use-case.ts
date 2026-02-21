import {
  type UserRepository,
} from '../../domain/repositories/user.repository.interface';
import {
  type PasswordServiceInterface,
} from '../interfaces/password.service.interface';
import {
  type RegisterUserDto,
} from '../dtos/register-user.dto';
import {
  type UserResponseDto,
} from '../dtos/user-response.dto';
import {
  User,
} from '../../domain/entities/user.entity';
import {
  Username,
} from '../../domain/value-objects/username.value-object';
import {
  Password,
} from '../../domain/value-objects/password.value-object';

/**
 * Use case for registering a new user.
 */
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordServiceInterface,
  ) {}

  /**
   * Executes the registration process.
   *
   * @param {RegisterUserDto} dto - The registration data.
   * @return {Promise<UserResponseDto>} A promise that resolves to the user response.
   */
  async execute(dto: RegisterUserDto): Promise<UserResponseDto> {
    const {username, password} = dto;

    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists.');
    }

    const passwordHash = await this.passwordService.hash(password);

    const user = new User({
      id: '',
      username: Username.create(username),
      passwordHash,
      roles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      username: savedUser.username.getValue(),
      roles: savedUser.roles.map(role => role.name),
      accessToken: '',
    };
  }
}
