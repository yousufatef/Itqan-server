import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    // TODO: implement
    @Get()
    findAll(@Query('search') search?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
        console.log('endpoint hit: GET /students');
        return { message: 'Students list placeholder', search, page, limit };
    }

    // TODO: implement
    @Post()
    create(@Body() body: any) {
        console.log('endpoint hit: POST /students');
        return { message: 'Student created placeholder', body };
    }

    // TODO: implement
    @Get(':id')
    findOne(@Param('id') id: string) {
        console.log(`endpoint hit: GET /students/${id}`);
        return { message: 'Student details placeholder', id };
    }

    // TODO: implement
    @Patch(':id')
    update(@Param('id') id: string, @Body() body: any) {
        console.log(`endpoint hit: PATCH /students/${id}`);
        return { message: 'Student updated placeholder', id, body };
    }

    // TODO: implement
    @Delete(':id')
    remove(@Param('id') id: string) {
        console.log(`endpoint hit: DELETE /students/${id}`);
        return { message: 'Student deleted placeholder', id };
    }

    // TODO: implement
    @Get('export')
    export() {
        console.log('endpoint hit: GET /students/export');
        return { message: 'Students export placeholder' };
    }
}
