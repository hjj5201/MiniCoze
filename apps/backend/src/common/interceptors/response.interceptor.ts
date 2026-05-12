import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { SKIP_RESPONSE_WRAP } from '../decorators/skip-response-wrap.decorator';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  T | ApiResponse<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<T | ApiResponse<T>> {
    const shouldSkipWrap = this.reflector.getAllAndOverride<boolean>(
      SKIP_RESPONSE_WRAP,
      [context.getHandler(), context.getClass()],
    );

    if (shouldSkipWrap) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        if (data instanceof StreamableFile) {
          return data;
        }

        return {
          code: 0,
          message: 'success',
          data,
        };
      }),
    );
  }
}
