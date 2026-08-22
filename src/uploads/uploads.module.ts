import { BadRequestException, Module } from "@nestjs/common";
import { UploadsController } from "./uploads.controller";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";

@Module({
    controllers: [UploadsController],
    imports: [MulterModule.register({
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const fileName = `${uniquePrefix}-${file.originalname}`;
                cb(null, fileName);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                return cb(null, true);
            }
            return cb(new BadRequestException('Only image files are allowed!'), false);
        },
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    })],
})

export class UploadsModule { }