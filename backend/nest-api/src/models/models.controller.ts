import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ModelsService } from './models.service';

@Controller('models')
export class ModelsController {
  constructor(private modelsService: ModelsService) {}

  @Get()
  findAll(@Query('provider') provider?: string, @Request() req?) {
    if (provider) {
      return this.modelsService.findByProvider(provider);
    }
    return this.modelsService.findAll(req?.user?.id);
  }

  @Get('defaults')
  getDefaults() {
    return this.modelsService.getDefaultModels();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.modelsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req, @Body() body: any) {
    return this.modelsService.create(req.user.id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(@Param('id') id: number, @Request() req) {
    return this.modelsService.remove(id, req.user.id);
  }
}
