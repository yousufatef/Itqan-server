import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";


@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const token = req.headers.authorization
        if (token && token.startsWith('Bearer ')) {
            next();
        } else {
            res.status(401).json({ message: 'Unauthorized' });
        }
    }
}