import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CirclesController } from './circles.controller';
import { CirclesService } from './circles.service';
import { Circle } from './entities/circle.entity';
import { CircleStudent } from './entities/circle-student.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Circle, CircleStudent])],
    controllers: [CirclesController],
    providers: [CirclesService],
    exports: [CirclesService],
})
export class CirclesModule { }
