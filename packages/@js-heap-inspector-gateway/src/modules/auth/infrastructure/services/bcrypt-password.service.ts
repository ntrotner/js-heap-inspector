import {
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  PasswordServiceInterface,
} from '../../application/interfaces/password.service.interface';

/**
 * Bcrypt password service implementation.
 */
@Injectable()
export class BcryptPasswordService implements PasswordServiceInterface {
  /**
   * Hashes a password.
   *
   * @param {string} password - The password to hash.
   * @return {Promise<string>} A promise that resolves to the hashed password.
   */
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  /**
   * Compares a password with a hash.
   *
   * @param {string} password - The password to compare.
   * @param {string} hash - The hash to compare against.
   * @return {Promise<boolean>} A promise that resolves to true if the password matches the hash.
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
