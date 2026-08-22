import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Observable, map } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>> {
  constructor(
    private readonly reflector: Reflector,
    private readonly i18n: I18nService,
  ) { }

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();
    const statusCode = response.statusCode;
    const messageKey =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? this.getDefaultMessageKey(request.method, statusCode);
    const lang = I18nContext.current(context)?.lang;

    return next.handle().pipe(
      map((data) => {
        if (this.isApiResponse(data)) {
          return data;
        }

        return {
          isSuccess: true,
          message: this.translate(messageKey, lang),
          errors: null,
          statusCode,
          result: data ?? null,
        };
      }),
    );
  }

  private getDefaultMessageKey(method: string, statusCode: number): string {
    if (statusCode === 201 || method === 'POST') return 'common.common.created';
    if (method === 'PUT' || method === 'PATCH') return 'common.common.updated';
    if (method === 'DELETE') return 'common.common.deleted';
    return 'common.common.retrieved';
  }

  private translate(key: string, lang?: string): string {
    return this.i18n.translate(key, { lang });
  }

  private isApiResponse(data: unknown): data is ApiResponse<T> {
    return (
      typeof data === 'object' &&
      data !== null &&
      'isSuccess' in data &&
      'statusCode' in data &&
      'result' in data
    );
  }
}
