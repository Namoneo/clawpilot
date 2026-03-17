import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RbacService } from './rbac.service';

@Controller('rbac')
@UseGuards(AuthGuard('jwt'))
export class RbacController {
  constructor(private rbacService: RbacService) {}

  @Get('roles')
  getRoles() {
    return this.rbacService.getAllRoles();
  }

  @Post('seed')
  async seed(@Request() req) {
    // Only admins can seed roles
    const userRole = req.user?.role;
    if (userRole !== 'admin') {
      throw new ForbiddenException('Only admins can seed roles');
    }
    return this.rbacService.seedRoles();
  }
}
