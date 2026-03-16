import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ModelConfigService } from './model-config.service';

@Controller('models')
@UseGuards(AuthGuard('jwt'))
export class ModelConfigController {
  constructor(private configService: ModelConfigService) {}

  @Get()
  getDefaults() {
    return this.configService.getDefaults();
  }

  @Get('configs')
  getConfigs(@Request() req, @Query('agentId') agentId?: string) {
    return this.configService.getUserConfigs(
      req.user.id,
      agentId ? parseInt(agentId, 10) : undefined,
    );
  }

  @Post('config')
  setConfig(
    @Request() req,
    @Body() body: { role: string; provider: string; model: string; agentId?: number; settings?: any },
  ) {
    return this.configService.setConfig(
      req.user.id,
      body.role,
      body.provider,
      body.model,
      body.agentId,
      body.settings,
    );
  }

  @Get('config/:role')
  getModel(
    @Request() req,
    @Param('role') role: string,
    @Query('agentId') agentId?: string,
  ) {
    return this.configService.getModelForRole(
      req.user.id,
      role,
      agentId ? parseInt(agentId, 10) : undefined,
    );
  }

  @Delete('config/:id')
  deleteConfig(@Param('id') id: string, @Request() req) {
    return this.configService.deleteConfig(parseInt(id, 10), req.user.id);
  }
}
