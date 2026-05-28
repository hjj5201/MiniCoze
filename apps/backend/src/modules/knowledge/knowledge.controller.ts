import {
  Body,
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ErrorCode } from '../../common/constants/error-code';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ChunkConfigDto } from './dto/chunk-config.dto';
import { ChunkDocumentResponseDto } from './dto/chunk-document-response.dto';
import { KnowledgeService } from './knowledge.service';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

@ApiTags('knowledge')
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post('chunk')
  @ApiOperation({
    summary: '上传文档并按指定策略切分',
    description:
      '接收 multipart/form-data：file（txt 或 md，<=10MB）+ config（JSON 字符串，描述切分策略与参数）。返回 chunks 数组，不入库。',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'config'],
      properties: {
        file: { type: 'string', format: 'binary' },
        config: {
          type: 'string',
          description: 'JSON 字符串，例如 {"chunkType":"default"}',
          example: '{"chunkType":"default"}',
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, type: ChunkDocumentResponseDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_UPLOAD_BYTES },
    }),
  )
  chunk(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('config') configRaw: string | undefined,
  ): ChunkDocumentResponseDto {
    if (!file) {
      throw new BusinessException(
        'missing file field',
        ErrorCode.BadRequest,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (configRaw === undefined || configRaw === null) {
      throw new BusinessException(
        'missing config field',
        ErrorCode.BadRequest,
        HttpStatus.BAD_REQUEST,
      );
    }

    // 仅暴露 service 需要的字段，避免 multer 类型与 service 强耦合。
    const result = this.knowledgeService.chunkDocument(
      { originalName: file.originalname, buffer: file.buffer },
      configRaw,
    );
    return result as ChunkDocumentResponseDto;
  }

  // Swagger 用，仅作为 schema 占位（class-validator 校验仍由 ChunkConfigDto.fromJsonString 走 JSON 字符串）。
  // 此处声明保证 ChunkConfigDto 被 swagger 扫描到。
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly _swaggerPlaceholder?: ChunkConfigDto;
}
