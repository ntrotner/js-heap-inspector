import {
  UseCase,
} from '@js-heap-inspector-gateway/common/application';
import {
  Injectable,
} from '@nestjs/common';
import {
  UserRepository,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/domain';
import {
  type FetchUserDto,
} from '../dtos/fetch-user.dto';
import {
  type UserProfileResponseDto,
} from '../dtos/user-profile-response.dto';

/**
 * Use case for fetching a user by ID.
 */
@Injectable()
export class FetchUserUseCase implements UseCase<FetchUserDto, UserProfileResponseDto | undefined> {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Executes the fetch user process.
   *
   * @param {FetchUserDto} dto - The fetch user data.
   * @return {Promise<UserProfileResponseDto>} A promise that resolves to the fetched user.
   */
  public async execute(dto: FetchUserDto): Promise<UserProfileResponseDto | undefined> {
    const user = await this.userRepository.findById(dto.id);
    if (!user) {
      throw new Error('User not found.');
    }

    return {
      id: user.id,
      username: user.username.getValue(),
      roles: user.roles.map(role => role.name),
    };
  }
}
