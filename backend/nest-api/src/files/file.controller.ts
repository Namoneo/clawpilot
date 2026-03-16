import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';

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
      agentId ? parseInt(agentId, 10) : undefined,
      description,
    );
  }

  @Get()
  getFiles(@Request() req) {
    return this.fileService.findByUser(req.user.id);
  }

  @Get(':id')
  getFile(@Param('id') id: string, @Request() req) {
    return this.fileService.findById(parseInt(id, 10));
  }

  @Delete(':id')
  deleteFile(@Param('id') id: string, @Request() req) {
    return this.fileService.delete(parseInt(id, 10), req.user.id);
  }
}
