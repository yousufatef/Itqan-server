import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayloadType } from "../../utils/types";
import { CURRENT_USER_KEY } from "../../utils/constants";

// custom decorator to get the current user from the request object

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user: JwtPayloadType = request[CURRENT_USER_KEY];
        return user;
    }
);