import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TeamsService } from './teams.service';

@Controller('teams')
@UseGuards(AuthGuard('jwt'))
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  findAll(@Request() req) {
    return this.teamsService.findAll(req.user.id);
  }

  @Post()
  create(@Request() req, @Body() body: { name: string }) {
    return this.teamsService.create(req.user.id, body.name);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @Request() req) {
    return this.teamsService.findOne(id, req.user.id);
  }

  @Post(':id/members')
  addMember(
    @Param('id') id: number,
    @Request() req,
    @Body() body: { userId: number; role: string },
  ) {
    return this.teamsService.addMember(id, req.user.id, body.userId, body.role as any);
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @Param('id') id: number,
    @Param('memberId') memberId: number,
    @Request() req,
  ) {
    return this.teamsService.removeMember(id, req.user.id, memberId);
  }
}
