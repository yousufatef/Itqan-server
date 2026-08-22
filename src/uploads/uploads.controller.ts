import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { ResponseMessage } from "../utils/decorators/response-message.decorator";


@Controller('api/uploads')
export class UploadsController {

    // Handle file upload with validation and custom storage configuration
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @ResponseMessage('uploads.uploaded')
    public uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('uploads.fileRequired');
        console.log('File uploaded:', { file });
        return file;
    }

    // Handle files upload with validation and custom storage configuration
    @Post("multiple-files")
    @UseInterceptors(FilesInterceptor('files'))
    @ResponseMessage('uploads.multipleUploaded')
    public uploadMultipleFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
        if (!files || files.length === 0) throw new BadRequestException('uploads.filesRequired');
        console.log('Files uploaded:', { files });
        return files;
    }

    //Get Image
    @Get(':image')
    public getImage(@Param('image') image: string, @Res() res: Response) {
        return res.sendFile(image, { root: './uploads' });
    }
}
