import { Controller, Get, Param } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
    constructor(private readonly publicService: PublicService) { }

    // TODO: implement
    @Get('parent-progress/:token')
    getParentProgress(@Param('token') token: string) {
        console.log(`endpoint hit: GET /public/parent-progress/${token}`);
        return { message: 'Parent progress data placeholder', token };
    }
}
