import { IsString, IsOptional, IsObject, MinLength } from 'class-validator';

export class CreateAgentDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsObject()
  @IsOptional()
  routing?: Record<string, any>;
}
