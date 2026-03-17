import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BackupService } from './backup.service';

@Controller('backup')
@UseGuards(AuthGuard('jwt'))
export class BackupController {
  constructor(private backupService: BackupService) {}

  @Post()
  createBackup() {
    return this.backupService.createBackup();
  }

  @Get()
  listBackups() {
    return this.backupService.listBackups();
  }

  @Post('restore')
  restore(@Body() body: { backupId: string }) {
    return this.backupService.restoreBackup(body.backupId);
  }
}
