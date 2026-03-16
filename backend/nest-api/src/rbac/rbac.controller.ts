import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
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
  seed(@Request() req) {
    // Only admins can seed
    return this.rbacService.seedRoles();
  }
}
