import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleName } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async seedRoles() {
    const existingRoles = await this.roleRepository.count();
    if (existingRoles > 0) return;

    // Create permissions
    const permissions = await this.permissionRepository.save([
      { name: 'agent:create', resource: 'agents', action: 'create' },
      { name: 'agent:read', resource: 'agents', action: 'read' },
      { name: 'agent:update', resource: 'agents', action: 'update' },
      { name: 'agent:delete', resource: 'agents', action: 'delete' },
      { name: 'user:create', resource: 'users', action: 'create' },
      { name: 'user:read', resource: 'users', action: 'read' },
      { name: 'billing:read', resource: 'billing', action: 'read' },
      { name: 'admin:*', resource: '*', action: '*' },
    ]);

    // Create roles
    await this.roleRepository.save([
      {
        name: RoleName.ADMIN,
        description: 'Full access to all resources',
        permissions,
      },
      {
        name: RoleName.USER,
        description: 'Standard user access',
        permissions: permissions.filter(p => !p.name.startsWith('admin')),
      },
      {
        name: RoleName.VIEWER,
        description: 'Read-only access',
        permissions: permissions.filter(p => p.action === 'read'),
      },
    ]);
  }

  async getRole(name: string): Promise<Role> {
    return this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({ relations: ['permissions'] });
  }

  async hasPermission(userRole: Role, resource: string, action: string): Promise<boolean> {
    return userRole.permissions.some(
      p => p.name === `${resource}:${action}` || p.name === 'admin:*' || p.resource === '*',
    );
  }
}
