import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyRecordsController } from './daily-records.controller';
import { DailyRecordsService } from './daily-records.service';
import { DailyRecord } from './entities/daily-record.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DailyRecord])],
    controllers: [DailyRecordsController],
    providers: [DailyRecordsService],
    exports: [DailyRecordsService],
})
export class DailyRecordsModule { }
