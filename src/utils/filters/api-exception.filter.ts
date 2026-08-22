import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import {
  I18nContext,
  I18nService,
  I18nValidationException,
} from 'nestjs-i18n';
import type { ValidationError } from 'class-validator';
import type { ApiResponse } from '../interfaces/api-response.interface';

type ValidationApiError = {
  field: string;
  message: string;
};

@Catch()
@Injectable()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) { }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const i18nContext = I18nContext.current(host);
    const lang = i18nContext?.lang;

    console.log(this.i18n.getSupportedLanguages?.());

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const isValidationException = exception instanceof I18nValidationException;
    const errors = isValidationException
      ? this.flattenValidationErrors(exception.errors, lang)
      : this.getHttpErrors(exception);

    const messageKey = isValidationException
      ? 'common.common.validationFailed'
      : this.getMessageKey(exception, statusCode);

    console.log('lang:', lang);
    console.log('messageKey:', messageKey);
    const body: ApiResponse = {
      isSuccess: false,
      message: this.translate(messageKey, lang),
      errors,
      statusCode,
      result: null,
    };

    response.status(statusCode).json(body);
  }

  private flattenValidationErrors(
    errors: ValidationError[],
    lang?: string,
    parentPath = '',
  ): ValidationApiError[] {
    return errors.flatMap((error) => {
      const field = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;
      const currentErrors = Object.values(error.constraints ?? {}).map(
        (message) => ({
          field,
          message: this.translateValidationMessage(message, lang),
        }),
      );
      return [
        ...currentErrors,
        ...this.flattenValidationErrors(error.children ?? [], lang, field),
      ];
    });
  }

  private translateValidationMessage(message: string, lang?: string): string {
    const separatorIndex = message.indexOf('|');
    if (separatorIndex === -1) {
      return this.translate(message, lang);
    }

    const key = message.slice(0, separatorIndex);
    const argsString = message.slice(separatorIndex + 1);
    let args: Record<string, unknown> = {};

    try {
      args = JSON.parse(argsString);
    } catch {
      args = {};
    }

    const constraints = Array.isArray(args.constraints)
      ? args.constraints.reduce<Record<string, unknown>>((acc, value, index) => {
        acc[index.toString()] = value;
        return acc;
      }, {})
      : undefined;

    return this.i18n.translate(key, {
      lang,
      args: {
        ...args,
        constraints,
      },
    });
  }

  private getMessageKey(exception: unknown, statusCode: number): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : this.getResponseMessage(response);

      if (message && this.looksLikeTranslationKey(message)) {
        return message;
      }
    }

    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'common.common.badRequest';
      case HttpStatus.UNAUTHORIZED:
        return 'common.common.unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'common.common.forbidden';
      case HttpStatus.NOT_FOUND:
        return 'common.common.notFound';
      case HttpStatus.CONFLICT:
        return 'common.common.alreadyExists';
      default:
        return 'common.common.internalServerError';
    }
  }

  private getResponseMessage(response: unknown): string | undefined {
    if (
      typeof response === 'object' &&
      response !== null &&
      'message' in response
    ) {
      const message = (response as { message?: string | string[] }).message;
      return Array.isArray(message) ? message[0] : message;
    }
    return undefined;
  }

  private getHttpErrors(exception: unknown): unknown[] | null {
    if (!(exception instanceof HttpException)) {
      return null;
    }

    const response = exception.getResponse();
    if (
      typeof response === 'object' &&
      response !== null &&
      'errors' in response &&
      Array.isArray((response as { errors?: unknown[] }).errors)
    ) {
      return (response as { errors: unknown[] }).errors;
    }

    return null;
  }

  private looksLikeTranslationKey(value: string): boolean {
    return /^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)+$/.test(value);
  }

  private translate(key: string, lang?: string): string {
    return this.i18n.translate(key, { lang });
  }
}
