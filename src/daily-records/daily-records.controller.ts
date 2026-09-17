import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';
import { DailyRecordsService } from './daily-records.service';
import { CreateDailyRecordItemDto } from './dto/create-daily-record-item.dto';
import { AuthRoleGuard } from '../users/guards/auth-role.guard';

@Controller('circles/:circleId/daily-records')
@UseGuards(AuthRoleGuard)
export class DailyRecordsController {
    constructor(private readonly dailyRecordsService: DailyRecordsService) {}

    @Get()
    @UseGuards(AuthRoleGuard)
    findByDate(
        @Param('circleId', ParseIntPipe) circleId: number,
        @Query('date') date?: string,
    ) {
        return this.dailyRecordsService.findByDate(circleId, date);
    }

    @Post()
    @UseGuards(AuthRoleGuard)
    createBatch(
        @Param('circleId', ParseIntPipe) circleId: number,
        @Body() items: CreateDailyRecordItemDto[],
        @Query('date') date?: string,
    ) {
        return this.dailyRecordsService.upsertBatch(circleId, date, items);
    }
}

