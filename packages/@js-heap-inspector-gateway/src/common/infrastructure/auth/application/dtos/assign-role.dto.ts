/**
 * Data Transfer Object for assigning a role to a user.
 */
export class AssignRoleDto {
  /**
   * The user ID.
   *
   * @type {string}
   */
  userId: string;

  /**
   * The role name to assign.
   *
   * @type {string}
   */
  roleName: string;
}
