/**
 * Data Transfer Object for user response.
 *
 * @property {string} id - The user ID.
 * @property {string} username - The username.
 * @property {string[]} roles - The roles assigned to the user.
 * @property {string} accessToken - The access token for the user.
 */
export class UserProfileResponseDto {
  /**
   * The user ID.
   *
   * @type {string}
   */
  id: string;

  /**
   * The username.
   *
   * @type {string}
   */
  username: string;

  /**
   * The roles assigned to the user.
   *
   * @type {string[]}
   */
  roles: string[];
}
