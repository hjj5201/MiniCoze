import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ description: '用户输入内容' })
  @IsNotEmpty()
  @IsString()
  content: string;
}
