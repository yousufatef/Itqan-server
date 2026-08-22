import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { DailyRecordsService } from './daily-records.service';

@Controller('circles/:circleId/daily-records')
export class DailyRecordsController {
    constructor(private readonly dailyRecordsService: DailyRecordsService) { }

    // TODO: implement
    @Get()
    findByDate(@Param('circleId') circleId: string, @Query('date') date?: string) {
        console.log(`endpoint hit: GET /circles/${circleId}/daily-records?date=${date}`);
        return { message: 'Daily records for date placeholder', circleId, date };
    }

    // TODO: implement
    @Post()
    createBatch(@Param('circleId') circleId: string, @Body() body: any) {
        console.log(`endpoint hit: POST /circles/${circleId}/daily-records`);
        return { message: 'Daily records batch created/updated placeholder', circleId, body };
    }
}
