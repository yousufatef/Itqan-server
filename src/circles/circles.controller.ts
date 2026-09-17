import { Controller, Get, Post, Body, Param, Patch, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CirclesService } from './circles.service';
import { CreateCircleDto } from './dto/create-circle.dto';
import { UpdateCircleDto } from './dto/update-circle.dto';
import { AuthRoleGuard } from '../users/guards/auth-role.guard';

@Controller('circles')
@UseGuards(AuthRoleGuard)
export class CirclesController {
    constructor(private readonly circlesService: CirclesService) {}

    @Get()
    @UseGuards(AuthRoleGuard)
    findAll(@Query('search') search?: string) {
        return this.circlesService.findAll(search);
    }

    @Post()
    @UseGuards(AuthRoleGuard)
    create(@Body() dto: CreateCircleDto) {
        return this.circlesService.create(dto);
    }

    @Get('export')
    @UseGuards(AuthRoleGuard)
    export() {
        // Placeholder — export logic to be added when needed
        return this.circlesService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthRoleGuard)
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.circlesService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(AuthRoleGuard)
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCircleDto) {
        return this.circlesService.update(id, dto);
    }

    @Patch(':id/toggle-active')
    @UseGuards(AuthRoleGuard)
    toggleActive(@Param('id', ParseIntPipe) id: number) {
        return this.circlesService.toggleActive(id);
    }

    @Delete(':id')
    @UseGuards(AuthRoleGuard)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.circlesService.remove(id);
    }
}

