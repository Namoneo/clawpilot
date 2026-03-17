import { Controller, Get, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from './audit.service';

function parseIntSafe(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function parseDateSafe(value: string | undefined): Date {
  if (!value) throw new BadRequestException('Date parameter required');
  const date = new Date(value);
  if (isNaN(date.getTime())) throw new BadRequestException('Invalid date format');
  return date;
}

@Controller('audit')
@UseGuards(AuthGuard('jwt'))
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  getAuditLogs(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findByUser(req.user.id, parseIntSafe(limit, 50));
  }

  @Get('entity')
  getByEntity(
    @Query('type') entityType: string,
    @Query('id') entityId: string,
  ) {
    const parsedId = parseIntSafe(entityId, 0);
    if (!entityType) throw new BadRequestException('entityType is required');
    if (parsedId <= 0) throw new BadRequestException('Invalid entityId');
    return this.auditService.findByEntity(entityType, parsedId);
  }

  @Get('range')
  getByDateRange(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.auditService.findByDateRange(parseDateSafe(start), parseDateSafe(end));
  }
}
