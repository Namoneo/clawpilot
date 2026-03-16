import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from './roles.service';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: Permission[]) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(PERMISSIONS_KEY, permissions, descriptor.value);
    return descriptor;
  };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    const userRole = user.role || 'user';
    
    // Simple role check - expand as needed
    const rolePermissions: Record<string, Permission[]> = {
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

    const userPermissions = rolePermissions[userRole] || [];

    return requiredPermissions.some(permission => 
      userPermissions.includes(permission) || userPermissions.includes(Permission.ADMIN)
    );
  }
}
