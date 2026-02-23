import {
  Role,
} from './role.entity';

describe('Role', () => {
  let role: Role;

  beforeEach(() => {
    role = new Role({
      id: '1',
      name: 'Admin',
      permissions: ['create', 'read', 'update', 'delete'],
    });
  });

  describe('constructor', () => {
    it('should create a role with the provided properties', () => {
      expect(role.id).toBe('1');
      expect(role.name).toBe('Admin');
      expect(role.permissions).toEqual(['create', 'read', 'update', 'delete']);
    });
  });
});
