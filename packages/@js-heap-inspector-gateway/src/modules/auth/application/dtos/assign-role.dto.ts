/**
 * Data Transfer Object for assigning a role to a user.
 *
 * @property {string} userId - The user ID.
 * @property {string} roleName - The role name to assign.
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
