import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SearchService, SearchOptions } from './search.service';

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
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
    };
    return this.searchService.search(options);
  }

  @Get('agents')
  searchAgents(@Query('q') query: string, @Query('userId') userId?: string) {
    return this.searchService.searchAgents(query, userId ? parseInt(userId, 10) : undefined);
  }
}
