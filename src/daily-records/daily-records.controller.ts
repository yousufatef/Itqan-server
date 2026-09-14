import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { DailyRecordsService } from './daily-records.service';
import { CreateDailyRecordItemDto } from './dto/create-daily-record-item.dto';

@Controller('circles/:circleId/daily-records')
export class DailyRecordsController {
    constructor(private readonly dailyRecordsService: DailyRecordsService) {}

    @Get()
    findByDate(
        @Param('circleId', ParseIntPipe) circleId: number,
        @Query('date') date?: string,
    ) {
        return this.dailyRecordsService.findByDate(circleId, date);
    }

    @Post()
    createBatch(
        @Param('circleId', ParseIntPipe) circleId: number,
        @Body() items: CreateDailyRecordItemDto[],
        @Query('date') date?: string,
    ) {
        return this.dailyRecordsService.upsertBatch(circleId, date, items);
    }
}
