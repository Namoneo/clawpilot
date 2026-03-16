import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from './audit.service';

@Controller('audit')
@UseGuards(AuthGuard('jwt'))
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  getAuditLogs(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findByUser(req.user.id, limit ? parseInt(limit, 10) : 50);
  }

  @Get('entity')
  getByEntity(
    @Query('type') entityType: string,
    @Query('id') entityId: string,
  ) {
    return this.auditService.findByEntity(entityType, parseInt(entityId, 10));
  }

  @Get('range')
  getByDateRange(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.auditService.findByDateRange(new Date(start), new Date(end));
  }
}
