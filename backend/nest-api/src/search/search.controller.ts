import { Controller, Get, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SearchService, SearchOptions } from './search.service';

function parseIntSafe(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

@Controller('search')
@UseGuards(AuthGuard('jwt'))
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  search(
    @Query('q') query: string,
    @Query('type') type: 'all' | 'agents' | 'runs' | 'users' = 'all',
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const options: SearchOptions = {
      query,
      type,
      limit: parseIntSafe(limit, 20),
      offset: parseIntSafe(offset, 0),
    };
    return this.searchService.search(options);
  }

  @Get('agents')
  searchAgents(@Query('q') query: string, @Query('userId') userId?: string) {
    const parsedUserId = parseIntSafe(userId, 0);
    return this.searchService.searchAgents(
      query, 
      parsedUserId > 0 ? parsedUserId : undefined
    );
  }
}
