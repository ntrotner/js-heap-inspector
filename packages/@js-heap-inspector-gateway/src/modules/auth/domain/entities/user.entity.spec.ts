import {
  Username,
} from '../value-objects/username.value-object';
import {
  User,
} from './user.entity';
import {
  Role,
} from './role.entity';

describe('User', () => {
  let user: User;
  let role1: Role;
  let role2: Role;

  beforeEach(() => {
    role1 = new Role({
      id: '1',
      name: 'Admin',
      permissions: ['create', 'read', 'update', 'delete'],
    });
    role2 = new Role({
      id: '2',
      name: 'User',
      permissions: ['read'],
    });
    user = new User({
      id: '1',
      username: Username.create('testuser'),
      passwordHash: 'hashedpassword',
      roles: [role1],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
  });

  describe('constructor', () => {
    it('should create a user with the provided properties', () => {
      expect(user.id).toBe('1');
      expect(user.username.getValue()).toBe('testuser');
      expect(user.passwordHash).toBe('hashedpassword');
      expect(user.roles).toContain(role1);
      expect(user.createdAt).toEqual(new Date('2024-01-01'));
      expect(user.updatedAt).toEqual(new Date('2024-01-01'));
    });
  });

  describe('addRole', () => {
    it('should add a role to the user', () => {
      user.addRole(role2);
      expect(user.roles).toContain(role2);
      expect(user.updatedAt).not.toEqual(new Date('2024-01-01'));
    });

    it('should not add a duplicate role', () => {
      const initialRolesLength = user.roles.length;
      user.addRole(role1);
      expect(user.roles.length).toBe(initialRolesLength);
    });

    it('should not add a duplicate role', () => {
      const initialRolesLength = user.roles.length;
      user.addRole(role1);
      expect(user.roles.length).toBe(initialRolesLength);
    });
  });

  describe('hasRole', () => {
    it('should return true if the user has the role', () => {
      expect(user.hasRole(role1)).toBe(true);
    });

    it('should return false if the user does not have the role', () => {
      expect(user.hasRole(role2)).toBe(false);
    });
  });
});
