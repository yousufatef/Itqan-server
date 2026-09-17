import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus, EvaluationGrade } from '../../utils/enums';

export class UpdateDailyRecordDto {
    @IsOptional()
    @IsEnum(AttendanceStatus, { message: `attendanceStatus must be one of: ${Object.values(AttendanceStatus).join(', ')}` })
    attendanceStatus?: AttendanceStatus;

    @IsOptional()
    @IsEnum(EvaluationGrade, { message: `evaluation must be one of: ${Object.values(EvaluationGrade).join(', ')}` })
    evaluation?: EvaluationGrade;

    @IsOptional()
    @IsString()
    notes?: string;
}

