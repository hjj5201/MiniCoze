import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('agent')
@Controller('agents')
export class AgentController {}
