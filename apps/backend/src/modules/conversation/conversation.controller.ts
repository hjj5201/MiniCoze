import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('conversation')
@Controller('conversations')
export class ConversationController {}
