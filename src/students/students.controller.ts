import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthRoleGuard } from '../users/guards/auth-role.guard';
import { ResponseMessage } from '../utils/decorators/response-message.decorator';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) { }

    @Get('getPaginatedStudents')
    @UseGuards(AuthRoleGuard)
    @ResponseMessage('common.students.listRetrieved')
    getPaginatedStudents(
        @Query('page') page = '1',
        @Query('limit') limit = '10',
        @Query('searchTerm') searchTerm?: string,
    ) {
        return this.studentsService.getPaginatedStudents(
            Math.max(1, parseInt(page, 10) || 1),
            Math.min(100, parseInt(limit, 10) || 10),
            searchTerm?.trim(),
        );
    }

    @Post('createStudent')
    @UseGuards(AuthRoleGuard)
    @ResponseMessage('common.students.created')
    createStudent(@Body() body: CreateStudentDto) {
        return this.studentsService.createStudent(body);
    }

    @Patch('updateStudent/:id')
    @UseGuards(AuthRoleGuard)
    @ResponseMessage('common.students.updated')
    updateStudent(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateStudentDto) {
        return this.studentsService.updateStudent(id, body);
    }

    @Delete('deleteStudent/:id')
    @UseGuards(AuthRoleGuard)
    @ResponseMessage('students deleted successfully')
    deleteStudent(@Param('id', ParseIntPipe) id: number) {
        return this.studentsService.deleteStudent({ id });
    }
}
