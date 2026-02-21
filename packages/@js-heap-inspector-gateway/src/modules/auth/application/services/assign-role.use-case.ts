import {
  type UserRepository,
} from '../../domain/repositories/user.repository.interface';
import {
  type AssignRoleDto,
} from '../dtos/assign-role.dto';

/**
 * Use case for assigning a role to a user.
 */
export class AssignRoleUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Executes the role assignment process.
   *
   * @param {AssignRoleDto} dto - The role assignment data.
   * @return {Promise<void>} A promise that resolves when the role is assigned.
   */
  async execute(dto: AssignRoleDto): Promise<void> {
    const {userId, roleName} = dto;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    await this.userRepository.assignRole(userId, roleName);
  }
}
