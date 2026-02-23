import {
  Password,
} from './password.value-object';

describe('Password', () => {
  describe('constructor', () => {
    it('should create a password with a hash', () => {
      const password = new Password('hashedpassword');
      expect(password.getHash()).toBe('hashedpassword');
    });
  });

  describe('getHash', () => {
    it('should return the password hash', () => {
      const password = new Password('hashedpassword');
      expect(password.getHash()).toBe('hashedpassword');
    });
  });

  describe('createFromPlainText', () => {
    it('should create a new Password instance from plain text', () => {
      const password = Password.createFromPlainText('plaintext', 'hashedpassword');
      expect(password.getHash()).toBe('hashedpassword');
    });
  });
});
