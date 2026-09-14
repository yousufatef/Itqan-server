import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyRecordsController } from './daily-records.controller';
import { DailyRecordsService } from './daily-records.service';
import { DailyRecord } from './entities/daily-record.entity';
import { Circle } from '../circles/entities/circle.entity';
import { CircleStudent } from '../circles/entities/circle-student.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DailyRecord, Circle, CircleStudent])],
    controllers: [DailyRecordsController],
    providers: [DailyRecordsService],
    exports: [DailyRecordsService],
})
export class DailyRecordsModule {}
