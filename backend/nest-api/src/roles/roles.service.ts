import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

export enum Permission {
  // Agents
  AGENT_CREATE = 'agent:create',
  AGENT_READ = 'agent:read',
  AGENT_UPDATE = 'agent:update',
  AGENT_DELETE = 'agent:delete',
  AGENT_START = 'agent:start',
  AGENT_STOP = 'agent:stop',
  
  // Billing
  BILLING_READ = 'billing:read',
  BILLING_MANAGE = 'billing:manage',
  
  // Users
  USER_READ = 'user:read',
  USER_MANAGE = 'user:manage',
  
  // Admin
  ADMIN = 'admin:full',
}

export const ROLE_PERMISSIONS = {
  user: [
    Permission.AGENT_CREATE,
    Permission.AGENT_READ,
    Permission.AGENT_UPDATE,
    Permission.AGENT_DELETE,
    Permission.AGENT_START,
    Permission.AGENT_STOP,
    Permission.BILLING_READ,
    Permission.USER_READ,
  ],
  admin: Object.values(Permission),
};

@Injectable()
export class RolesService {
  
  hasPermission(userRole: string, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    return permissions.includes(permission) || permissions.includes(Permission.ADMIN);
  }

  hasAnyPermission(userRole: string, permissions: Permission[]): boolean {
    return permissions.some(p => this.hasPermission(userRole, p));
  }

  hasAllPermissions(userRole: string, permissions: Permission[]): boolean {
    return permissions.every(p => this.hasPermission(userRole, p));
  }

  getPermissions(role: string): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private rolesService: RolesService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      return false;
    }

    // Get required permissions from decorator
    const permissions = Reflect.getMetadata('permissions', context.getHandler());
    
    if (!permissions || permissions.length === 0) {
      return true;
    }

    const userRole = user.role || 'user';
    return this.rolesService.hasAnyPermission(userRole, permissions);
  }
}
