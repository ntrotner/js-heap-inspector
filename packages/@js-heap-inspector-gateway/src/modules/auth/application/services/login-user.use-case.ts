import {
  type UserRepository,
} from '../../domain/repositories/user.repository.interface';
import {
  type PasswordServiceInterface,
} from '../interfaces/password.service.interface';
import {
  type JwtServiceInterface,
} from '../interfaces/jwt.service.interface';
import {
  type LoginUserDto,
} from '../dtos/login-user.dto';
import {
  type UserResponseDto,
} from '../dtos/user-response.dto';
import {
  User,
} from '../../domain/entities/user.entity';

/**
 * Use case for logging in a user.
 */
export class LoginUserUseCase {
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
  async execute(dto: LoginUserDto): Promise<UserResponseDto> {
    const {username, password} = dto;

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

    const accessToken = await this.jwtService.generateToken(JSON.stringify({
      id: user.id,
      username: user.username.getValue(),
      roles: user.roles.map(role => role.name),
      createdAt: user.createdAt,
    }));

    return {
      id: user.id,
      username: user.username.getValue(),
      roles: user.roles.map(role => role.name),
      accessToken,
    };
  }
}
