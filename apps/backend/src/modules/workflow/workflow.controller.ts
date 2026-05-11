import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('workflow')
@Controller('workflows')
export class WorkflowController {}
