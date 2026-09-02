import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateStudentDto {
    @IsOptional()
    @IsString()
    name?: string;

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
    @IsDateString()
    birth_date?: string | Date;

    @IsOptional()
    @IsNumber()
    parent?: number;

    @IsOptional()
    @IsNumber()
    parentId?: number;

    @IsOptional()
    @IsNumber()
    parent_id?: number;
}
