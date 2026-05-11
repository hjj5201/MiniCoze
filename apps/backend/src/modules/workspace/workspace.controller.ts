import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('workspace')
@Controller('workspaces')
export class WorkspaceController {}
