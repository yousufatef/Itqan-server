export class CreateDailyRecordDto {
    student_id!: number;
    circle_id!: number;
    teacher_id!: number;
    record_date!: Date;
    attendance_status!: string;
    evaluation?: string;
    notes?: string;
}
