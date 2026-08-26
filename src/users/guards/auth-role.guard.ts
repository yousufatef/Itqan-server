import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { CURRENT_USER_KEY } from "../../utils/constants";
import { UserRole } from "../../utils/enums";
import { UsersService } from "../users.service";

@Injectable()
export class AuthRoleGuard implements CanActivate {

    constructor(
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
        private readonly userService: UsersService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const [type, token] = request.headers.authorization?.split(' ') || [];

        if (!token || type !== 'Bearer') {
            throw new UnauthorizedException("common.auth.noToken");
        }

        let payload: any;
        try {
            payload = this.jwtService.verify(token, {
                secret: this.config.get<string>('JWT_ACCESS_SECRET'),
            });
        } catch {
            // ✅ Only JWT errors caught here — not ForbiddenException
            throw new UnauthorizedException("common.auth.invalidToken");
        }

        const user = await this.userService.getCurrentUser(payload.id);

        if (!user) {
            throw new UnauthorizedException("common.auth.userNotFound");
        }

        if (!user.isActive) {
            throw new UnauthorizedException("common.auth.inactiveAccount");
        }

        if (user.tokenVersion !== payload.tokenVersion) {
            throw new UnauthorizedException("common.auth.tokenRevoked");
        }

        if (![UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.userType)) {
            throw new ForbiddenException("common.auth.insufficientRole");
        }

        request[CURRENT_USER_KEY] = user;
        return true;
    }
}
