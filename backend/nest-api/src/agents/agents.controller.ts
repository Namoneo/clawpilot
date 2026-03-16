import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';

@Controller('agents')
@UseGuards(AuthGuard('jwt'))
export class AgentsController {
  constructor(private agentsService: AgentsService) {}

  @Post()
  async create(@Request() req, @Body() createAgentDto: CreateAgentDto) {
    return this.agentsService.create(req.user.id, createAgentDto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.agentsService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.agentsService.findOne(id, req.user.id);
  }

  @Post(':id/start')
  async start(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.agentsService.start(id, req.user.id);
  }

  @Post(':id/stop')
  async stop(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.agentsService.stop(id, req.user.id);
  }

  @Get(':id/logs')
  async getLogs(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.agentsService.getLogs(id, req.user.id);
  }

  @Get(':id/runs')
  async getRuns(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.agentsService.getRuns(id, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.agentsService.remove(id, req.user.id);
  }
}
