import {
  UseCase,
} from '@js-heap-inspector-gateway/common/application';
import {
  Injectable,
} from '@nestjs/common';
import {
  JwtServiceInterface,
  LoginUserDto,
  PasswordServiceInterface,
  UserResponseDto,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/application';
import {
  UserRepository,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/domain';

/**
 * Use case for logging in a user.
 */
@Injectable()
export class LoginUserUseCase implements UseCase<LoginUserDto, UserResponseDto> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordServiceInterface,
    private readonly jwtService: JwtServiceInterface,
  ) {}

  /**
   * Executes the login process.
   *
   * @param {LoginUserDto} dto - The login data.
   * @return {Promise<UserResponseDto>} A promise that resolves to the user response.
   */
  public async execute(dto: LoginUserDto): Promise<UserResponseDto> {
    const {username, password} = dto;

    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error('Invalid username.');
    }

    const isPasswordValid = await this.passwordService.compare(
      password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid password.');
    }

    const accessToken = await this.jwtService.generateToken({
      user: {
        id: user.id,
        username: user.username.getValue(),
      },
      roles: user.roles.map(role => role.name),
      createdAt: user.createdAt.getTime(),
    });

    return {
      id: user.id,
      username: user.username.getValue(),
      roles: user.roles.map(role => role.name),
      accessToken,
    };
  }
}
