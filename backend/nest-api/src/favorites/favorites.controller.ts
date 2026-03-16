import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(AuthGuard('jwt'))
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  findAll(@Request() req, @Query('type') type?: string) {
    return this.favoritesService.findAll(req.user.id, type);
  }

  @Post()
  create(@Request() req, @Body() body: { itemId: number; type: string; name: string }) {
    return this.favoritesService.create(req.user.id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @Request() req) {
    return this.favoritesService.remove(id, req.user.id);
  }

  @Get('check')
  check(@Request() req, @Query('itemId') itemId: string, @Query('type') type: string) {
    return { isFavorite: this.favoritesService.check(req.user.id, parseInt(itemId), type) };
  }
}
