/**
 * Represents a role in the system.
 *
 * @property {string} id - Unique identifier for the role.
 * @property {string} name - Name of the role.
 * @property {string[]} permissions - Permissions associated with the role.
 */
export class Role {
  id: string;
  name: string;
  permissions: string[];

  /**
   * Creates a new Role instance.
   *
   * @param {Object} properties - Role properties.
   * @param {string} properties.id - Unique identifier.
   * @param {string} properties.name - Role name.
   * @param {string[]} properties.permissions - Array of permissions.
   */
  constructor(properties: {id: string; name: string; permissions: string[]}) {
    this.id = properties.id;
    this.name = properties.name;
    this.permissions = properties.permissions;
  }
}
