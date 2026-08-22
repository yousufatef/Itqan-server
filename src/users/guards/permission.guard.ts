// guards/permission.guard.ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesService } from "../../roles/roles.service";
import { PERMISSIONS_KEY, RequiredPermission } from "../decorators/permissions.decorator";
import { UserType } from "../../utils/enums";
import { CURRENT_USER_KEY } from "../../utils/constants";

@Injectable()
export class PermissionGuard implements CanActivate {

    constructor(
        private readonly reflector: Reflector,
        private readonly rolesService: RolesService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request[CURRENT_USER_KEY];

        if (user.userType === UserType.SUPER_ADMIN) {
            return true;
        }

        if (user.userType !== UserType.ADMIN) {
            throw new ForbiddenException('common.auth.accessDenied');
        }

        if (!user.roleId) {
            throw new ForbiddenException('common.common.forbidden');
        }

        const role = await this.rolesService.findOneWithPermissions(user.roleId);
        if (!role) {
            throw new ForbiddenException('common.roles.notFound');
        }

        const hasPermission = requiredPermissions.every(req => {
            const rp = role.rolePermissions.find(rp => rp.permission.nameEn === req.resource);
            if (!rp) return false;

            switch (req.action) {
                case 'create': return rp.canCreate;
                case 'read': return rp.canRead;
                case 'update': return rp.canUpdate;
                case 'delete': return rp.canDelete;
                default: return false;
            }
        });

        if (!hasPermission) {
            throw new ForbiddenException('common.common.forbidden');
        }

        return true;
    }
}
