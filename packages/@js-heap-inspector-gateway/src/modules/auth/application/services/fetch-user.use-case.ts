import {
  type UserRepository,
} from '../../domain/repositories/user.repository.interface';
import {
  type FetchUserDto,
} from '../dtos/fetch-user.dto';
import {
  type UserProfileResponseDto,
} from '../dtos/user-profile-response.dto';

/**
 * Use case for fetching a user by ID.
 */
export class FetchUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Executes the fetch user process.
   *
   * @param {FetchUserDto} dto - The fetch user data.
   * @return {Promise<UserProfileResponseDto>} A promise that resolves to the fetched user.
   */
  async execute(dto: FetchUserDto): Promise<UserProfileResponseDto | undefined> {
    const user = await this.userRepository.findById(dto.id);
    if (!user) {
      return;
    }

    return {
      id: user.id,
      username: user.username.getValue(),
      roles: user.roles.map(role => role.name),
    };
  }
}
