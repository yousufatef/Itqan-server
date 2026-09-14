import { Controller, Get, Post, Body, Param, Patch, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { CirclesService } from './circles.service';
import { CreateCircleDto } from './dto/create-circle.dto';
import { UpdateCircleDto } from './dto/update-circle.dto';

@Controller('circles')
export class CirclesController {
    constructor(private readonly circlesService: CirclesService) {}

    @Get()
    findAll(@Query('search') search?: string) {
        return this.circlesService.findAll(search);
    }

    @Post()
    create(@Body() dto: CreateCircleDto) {
        return this.circlesService.create(dto);
    }

    @Get('export')
    export() {
        // Placeholder — export logic to be added when needed
        return this.circlesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.circlesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCircleDto) {
        return this.circlesService.update(id, dto);
    }

    @Patch(':id/toggle-active')
    toggleActive(@Param('id', ParseIntPipe) id: number) {
        return this.circlesService.toggleActive(id);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.circlesService.remove(id);
    }
}
