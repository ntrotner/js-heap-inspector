import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

/**
 * Data Transfer Object for registering a new user.
 *
 * @property {string} username - The username for the new user.
 * @property {string} password - The password for the new user.
 */
export class RegisterUserDto {
  /**
   * The username for the new user.
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
   * The password for the new user.
   *
   * @type {string}
   */
  @IsString()
  @MinLength(8)
  @MaxLength(32)
    password: string;
}
