import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode } from '../constants/error-code';
import { BusinessException } from '../exceptions/business.exception';

interface ExceptionResponseBody {
  code?: number;
  message?: string | string[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const { status, code, message } = this.normalizeException(exception);

    if (!(exception instanceof HttpException)) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      code,
      message,
      data: null,
    });
  }

  private normalizeException(exception: unknown) {
    if (exception instanceof BusinessException) {
      return {
        status: exception.getStatus(),
        code: exception.getErrorCode(),
        message: exception.message,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const body =
        typeof exceptionResponse === 'object' && exceptionResponse !== null
          ? (exceptionResponse as ExceptionResponseBody)
          : undefined;
      const message = this.formatMessage(body?.message ?? exception.message);

      return {
        status,
        code: this.getCodeByStatus(status),
        message,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.InternalServerError,
      message: 'Internal server error',
    };
  }

  private formatMessage(message: string | string[]) {
    return Array.isArray(message) ? message.join('; ') : message;
  }

  private getCodeByStatus(status: number) {
    const codeMap: Record<number, ErrorCode> = {
      [HttpStatus.BAD_REQUEST]: ErrorCode.BadRequest,
      [HttpStatus.UNAUTHORIZED]: ErrorCode.Unauthorized,
      [HttpStatus.FORBIDDEN]: ErrorCode.Forbidden,
      [HttpStatus.NOT_FOUND]: ErrorCode.NotFound,
      [HttpStatus.INTERNAL_SERVER_ERROR]: ErrorCode.InternalServerError,
    };

    return codeMap[status] ?? ErrorCode.BusinessError;
  }
}
