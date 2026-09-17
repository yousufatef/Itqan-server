import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { DailyRecordsService } from './daily-records.service';
import { CreateDailyRecordItemDto } from './dto/create-daily-record-item.dto';
import { UpdateDailyRecordDto } from './dto/update-daily-record.dto';
import { AuthRoleGuard } from '../users/guards/auth-role.guard';
import { ResponseMessage } from '../utils/decorators/response-message.decorator';

@Controller('circles/:circleId/daily-records')
@UseGuards(AuthRoleGuard)
export class DailyRecordsController {
    constructor(private readonly dailyRecordsService: DailyRecordsService) {}

    @Get()
    @UseGuards(AuthRoleGuard)
    @ResponseMessage('common.dailyRecords.retrieved')
    findByDate(
        @Param('circleId', ParseIntPipe) circleId: number,
        @Query('date') date?: string,
    ) {
        return this.dailyRecordsService.findByDate(circleId, date);
    }

    @Post()
    @UseGuards(AuthRoleGuard)
    @ResponseMessage('common.dailyRecords.created')
    create(
        @Param('circleId', ParseIntPipe) circleId: number,
        @Body() dto: CreateDailyRecordItemDto,
        @Query('date') date?: string,
    ) {
        return this.dailyRecordsService.createRecord(circleId, date, dto);
    }

    @Patch(':id')
    @UseGuards(AuthRoleGuard)
    @ResponseMessage('common.dailyRecords.updated')
    update(
        @Param('circleId', ParseIntPipe) circleId: number,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateDailyRecordDto,
        @Query('date') date?: string,
    ) {
        return this.dailyRecordsService.updateRecord(circleId, id, dto, date);
    }
}



