import {
    IsNumber,
    IsEnum,
    IsString,
    IsOptional,
} from 'class-validator';
import { AttendanceStatus, EvaluationGrade } from '../../utils/enums';

export class CreateDailyRecordItemDto {
    @IsNumber({}, { message: 'studentId must be a number' })
    studentId!: number;

    @IsEnum(AttendanceStatus, { message: `attendanceStatus must be one of: ${Object.values(AttendanceStatus).join(', ')}` })
    attendanceStatus!: AttendanceStatus;

    @IsOptional()
    @IsEnum(EvaluationGrade, { message: `evaluation must be one of: ${Object.values(EvaluationGrade).join(', ')}` })
    evaluation?: EvaluationGrade;

    @IsOptional()
    @IsString()
    notes?: string;
}
