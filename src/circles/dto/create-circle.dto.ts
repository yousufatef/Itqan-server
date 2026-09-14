import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsArray,
    ArrayNotEmpty,
    IsIn,
    Matches,
} from 'class-validator';

const VALID_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export class CreateCircleDto {
    @IsString()
    @IsNotEmpty({ message: 'Circle name is required' })
    name!: string;

    @IsNumber({}, { message: 'teacherId must be a number' })
    teacherId!: number;

    @IsArray({ message: 'studentIds must be an array' })
    studentIds!: number[];

    @IsArray({ message: 'days must be an array' })
    @ArrayNotEmpty({ message: 'days must not be empty' })
    @IsIn(VALID_DAYS, { each: true, message: `Each day must be one of: ${VALID_DAYS.join(', ')}` })
    days!: string[];

    @IsString()
    @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be in HH:mm format' })
    startTime!: string;

    @IsString()
    @Matches(/^\d{2}:\d{2}$/, { message: 'endTime must be in HH:mm format' })
    endTime!: string;
}
