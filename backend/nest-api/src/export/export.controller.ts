import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { Response } from 'express';
import { ExportService, ExportFormat, ExportType } from './export.service';

@Controller('export')
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Post()
  async export(
    @Body() body: { data: any[]; format: string; type: string },
    @Res() res: Response,
  ) {
    const { data, format, type } = body;
    const content = await this.exportService.exportData(data, format as ExportFormat);
    const filename = this.exportService.generateFilename(type as ExportType, format as ExportFormat);
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }
}
