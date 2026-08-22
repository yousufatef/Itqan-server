import { Controller, Get } from '@nestjs/common';
import { TeachersService } from './teachers.service';

@Controller('teachers')
export class TeachersController {
    constructor(private readonly teachersService: TeachersService) { }

    // TODO: implement
    @Get()
    findAll() {
        console.log('endpoint hit: GET /teachers');
        return { message: 'Teachers dropdown list placeholder' };
    }
}
