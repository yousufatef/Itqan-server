import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { CirclesService } from './circles.service';

@Controller('circles')
export class CirclesController {
    constructor(private readonly circlesService: CirclesService) { }

    // TODO: implement
    @Get()
    findAll(@Query('search') search?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
        console.log('endpoint hit: GET /circles');
        return { message: 'Circles list placeholder', search, page, limit };
    }

    // TODO: implement
    @Post()
    create(@Body() body: any) {
        console.log('endpoint hit: POST /circles');
        return { message: 'Circle created placeholder', body };
    }

    // TODO: implement
    @Get(':id')
    findOne(@Param('id') id: string) {
        console.log(`endpoint hit: GET /circles/${id}`);
        return { message: 'Circle details placeholder', id };
    }

    // TODO: implement
    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        console.log(`endpoint hit: PATCH /circles/${id}`);
        return { message: 'Circle updated placeholder', id, body };
    }

    // TODO: implement
    @Patch(':id/toggle-active')
    toggleActive(@Param('id') id: string) {
        console.log(`endpoint hit: PATCH /circles/${id}/toggle-active`);
        return { message: 'Circle active status toggled placeholder', id };
    }

    // TODO: implement
    @Delete(':id')
    remove(@Param('id') id: string) {
        console.log(`endpoint hit: DELETE /circles/${id}`);
        return { message: 'Circle deleted placeholder', id };
    }

    // TODO: implement
    @Get('export')
    export() {
        console.log('endpoint hit: GET /circles/export');
        return { message: 'Circles export placeholder' };
    }
}
