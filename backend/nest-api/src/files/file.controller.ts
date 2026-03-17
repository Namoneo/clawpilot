import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';

function parseIntSafe(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
}

@Controller('files')
@UseGuards(AuthGuard('jwt'))
export class FileController {
  constructor(private fileService: FileService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
    @Body('agentId') agentId?: string,
    @Body('description') description?: string,
  ) {
    return this.fileService.upload(
      file,
      req.user.id,
      parseIntSafe(agentId),
      description,
    );
  }

  @Get()
  getFiles(@Request() req) {
    return this.fileService.findByUser(req.user.id);
  }

  @Get(':id')
  getFile(@Param('id') id: string, @Request() req) {
    const parsedId = parseIntSafe(id);
    if (!parsedId) {
      throw new BadRequestException('Invalid ID');
    }
    return this.fileService.findById(parsedId);
  }

  @Delete(':id')
  deleteFile(@Param('id') id: string, @Request() req) {
    const parsedId = parseIntSafe(id);
    if (!parsedId) {
      throw new BadRequestException('Invalid ID');
    }
    return this.fileService.delete(parsedId, req.user.id);
  }
}
