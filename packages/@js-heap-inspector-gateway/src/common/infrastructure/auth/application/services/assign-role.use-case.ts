import {
  UseCase,
} from '@js-heap-inspector-gateway/common/application';
import {
  AssignRoleDto,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/application';
import {
  UserRepository,
} from '@js-heap-inspector-gateway/common/infrastructure/auth/domain';
import {
  Injectable,
} from '@nestjs/common';

/**
 * Use case for assigning a role to a user.
 */
@Injectable()
export class AssignRoleUseCase implements UseCase<AssignRoleDto, void> {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Executes the role assignment process.
   *
   * @param {AssignRoleDto} dto - The role assignment data.
   * @return {Promise<void>} A promise that resolves when the role is assigned.
   */
  public async execute(dto: AssignRoleDto): Promise<void> {
    const {userId, roleName} = dto;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    await this.userRepository.assignRole(userId, roleName);
  }
}
