import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWorkspaceDto {
  @ApiProperty({ example: '默认空间' })
  @IsString()
  @MaxLength(50)
  name!: string;

  @ApiPropertyOptional({ example: '用于管理个人 Agent 和知识库' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
