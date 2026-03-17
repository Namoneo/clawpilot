import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeyService } from './api-key.service';

@Controller('api-keys')
@UseGuards(AuthGuard('jwt'))
export class ApiKeyController {
  constructor(private apiKeyService: ApiKeyService) {}

  @Post()
  async create(
    @Request() req,
    @Body() body: { name: string; permissions?: string[]; expiresAt?: string },
  ) {
    const result = await this.apiKeyService.create(
      req.user.id,
      body.name,
      body.permissions,
      body.expiresAt ? new Date(body.expiresAt) : undefined,
    );
    
    // Return API key only once
    return {
      id: result.apiKey.id,
      name: result.apiKey.name,
      key: result.rawKey, // Only returned on creation
      permissions: result.apiKey.permissions,
      expiresAt: result.apiKey.expiresAt,
      createdAt: result.apiKey.createdAt,
    };
  }

  @Get()
  findAll(@Request() req) {
    // Don't return the actual key
    return this.apiKeyService.findByUser(req.user.id).then(keys => 
      keys.map(k => ({ ...k, key: '********' }))
    );
  }

  @Delete(':id')
  revoke(@Param('id') id: string, @Request() req) {
    return this.apiKeyService.revoke(parseInt(id, 10), req.user.id);
  }
}
