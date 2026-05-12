import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('publish')
@Controller('publish')
export class PublishController {}
