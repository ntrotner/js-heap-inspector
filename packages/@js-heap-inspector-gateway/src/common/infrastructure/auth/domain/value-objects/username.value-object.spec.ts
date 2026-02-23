import {
  Username,
} from './username.value-object';

describe('Username', () => {
  describe('constructor', () => {
    it('should create a username with a valid value', () => {
      const username = new Username('validuser');
      expect(username.getValue()).toBe('validuser');
    });

    it('should throw an error if the username is too short', () => {
      expect(() => new Username('short')).toThrow('Username must be between 8 and 32 characters long.');
    });

    it('should throw an error if the username is too long', () => {
      expect(() => new Username('thisusernameistoolongforourvalidationrules')).toThrow('Username must be between 8 and 32 characters long.');
    });

    it('should throw an error if the username contains special characters', () => {
      expect(() => new Username('invalid@user')).toThrow('Username can only contain alphanumeric characters.');
    });
  });

  describe('getValue', () => {
    it('should return the username value', () => {
      const username = new Username('testuser');
      expect(username.getValue()).toBe('testuser');
    });
  });
  describe('create', () => {
    it('should create a new Username instance', () => {
      const username = Username.create('newuser1');
      expect(username.getValue()).toBe('newuser1');
    });

    it('should throw an error if the username is invalid', () => {
      expect(() => Username.create('invalid')).toThrow('Username must be between 8 and 32 characters long.');
    });
  });
});
