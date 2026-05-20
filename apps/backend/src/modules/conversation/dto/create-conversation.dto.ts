import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ description: 'Agent ID' })
  @IsNotEmpty()
  @IsString()
  agentId: string;

  @ApiProperty({ description: '用户输入内容' })
  @IsNotEmpty()
  @IsString()
  content: string;
}
