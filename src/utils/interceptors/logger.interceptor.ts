import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<any> {
        console.log('Before handling the request...');

        return next.handle().pipe(
            map((dataFromRouteHandler) => {
                const { password, ...otherData } = dataFromRouteHandler;
                return otherData;
            }),
        );
    }
}