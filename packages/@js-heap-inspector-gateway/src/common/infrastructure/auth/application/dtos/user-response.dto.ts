/**
 * Data Transfer Object for user response.
 */
export class UserResponseDto {
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

  /**
   * The access token for the user.
   *
   * @type {string}
   */
  accessToken: string;
}
