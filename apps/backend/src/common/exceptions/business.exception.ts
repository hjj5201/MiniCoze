import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../constants/error-code';

export class BusinessException extends HttpException {
  constructor(
    message = 'Business error',
    private readonly code = ErrorCode.BusinessError,
    status = HttpStatus.BAD_REQUEST,
  ) {
    super({ code, message, data: null }, status);
  }

  getErrorCode(): number {
    return this.code;
  }
}
