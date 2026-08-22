import { Controller, Get, Post, Param } from '@nestjs/common';
import { ParentsService } from './parents.service';

@Controller('parents')
export class ParentsController {
    constructor(private readonly parentsService: ParentsService) { }

    // TODO: implement
    @Get()
    findAll() {
        console.log('endpoint hit: GET /parents');
        return { message: 'Parents dropdown list placeholder' };
    }

    // TODO: implement
    @Post(':id/regenerate-link')
    regenerateLink(@Param('id') id: string) {
        console.log(`endpoint hit: POST /parents/${id}/regenerate-link`);
        return { message: 'Access token regenerated placeholder' };
    }
}
