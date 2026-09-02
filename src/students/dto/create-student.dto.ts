import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStudentDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    phone_number?: string;

    @IsOptional()
    @IsDateString()
    birthOfDate?: string | Date;


    @IsOptional()
    @IsNumber()
    parent_id?: number;
}
