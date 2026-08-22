import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { CURRENT_USER_KEY } from "../../utils/constants";

@Injectable()

export class AuthGuard implements CanActivate {

    constructor(
        private readonly jwtService: JwtService,
        private readonly config: ConfigService
    ) { }

    canActivate(context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest()
        const [type, token] = request.headers.authorization?.split(' ') || [];
        if (token && type === 'Bearer') {
            try {
                const payload = this.jwtService.verify(token, {
                    secret: this.config.get<string>('JWT_ACCESS_SECRET'),
                });
                request[CURRENT_USER_KEY] = payload;
            } catch (error) {
                throw new UnauthorizedException("common.auth.invalidToken")
            }
        } else {
            throw new UnauthorizedException("common.auth.noToken")
        }
        return true;
    }

}
