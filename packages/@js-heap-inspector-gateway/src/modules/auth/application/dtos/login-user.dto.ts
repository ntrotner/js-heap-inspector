import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

/**
 * Data Transfer Object for logging in a user.
 *
 * @property {string} username - The username for login.
 * @property {string} password - The password for login.
 */
export class LoginUserDto {
  /**
   * The username for login.
   *
   * @type {string}
   */
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/^[a-zA-Z\d]+$/, {
    message: 'Username can only contain alphanumeric characters.',
  })
    username: string;

  /**
   * The password for login.
   *
   @type {string}
   */
  @IsString()
  @MinLength(8)
    password: string;
}
