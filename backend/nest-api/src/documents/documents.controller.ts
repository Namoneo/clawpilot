import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Query, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DocumentsService } from './documents.service';

@Controller('documents')
@UseGuards(AuthGuard('jwt'))
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    return this.documentsService.findAll(req.user.id, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      type,
    });
  }

  @Post()
  create(
    @Request() req,
    @Body() body: { name: string; content: string; type: string; metadata?: Record<string, any> },
  ) {
    return this.documentsService.create(req.user.id, body);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.documentsService.getStats(req.user.id);
  }

  @Get('search')
  search(@Request() req, @Query('q') query: string) {
    return this.documentsService.search(req.user.id, query);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @Request() req) {
    return this.documentsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Request() req, @Body() body: any) {
    return this.documentsService.update(id, req.user.id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @Request() req) {
    return this.documentsService.remove(id, req.user.id);
  }
}
