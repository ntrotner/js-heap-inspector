import {
  randomUUID,
} from 'node:crypto';
import {
  UseCase,
} from '@js-heap-inspector-gateway/common/application';
import {
  Injectable,
} from '@nestjs/common';
import {
  PasswordServiceInterface,
  RegisterUserDto,
  UserResponseDto,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/application';
import {
  User,
  Username,
  UserRepository,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/domain';

/**
 * Use case for registering a new user.
 */
@Injectable()
export class RegisterUserUseCase implements UseCase<RegisterUserDto, UserResponseDto> {
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
  public async execute(dto: RegisterUserDto): Promise<UserResponseDto> {
    const {username, password} = dto;

    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists.');
    }

    const passwordHash = await this.passwordService.hash(password);

    const user = User.create({
      id: randomUUID(),
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
