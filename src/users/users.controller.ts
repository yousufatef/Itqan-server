import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, BadRequestException, UploadedFile, UseInterceptors, Res, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from './guards/auth.guard';
import { AuthRoleGuard } from './guards/auth-role.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/user-role.decorator';
import { UserType } from '../utils/enums';
import { FileInterceptor } from '@nestjs/platform-express';
import type { JwtPayloadType } from '../utils/types';
import type { Response } from 'express';
import { ResponseMessage } from '../utils/decorators/response-message.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Delete('images/remove-profile-image')
  @UseGuards(AuthGuard)
  @ResponseMessage('users.profileImageRemoved')
  removeProfileImage(@CurrentUser() payload: JwtPayloadType) {
    return this.usersService.removeProfileImage(payload.id);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRoleGuard)
  @ResponseMessage('common.users.deleted')
  remove(@CurrentUser() payload: JwtPayloadType) {
    return this.usersService.remove(payload.id);
  }

  // ✅ Static GET routes before dynamic :id
  @Get('profile')
  @UseGuards(AuthGuard)
  @ResponseMessage('common.users.retrieved')
  getCurrentUser(@CurrentUser() payload: JwtPayloadType) {
    return this.usersService.getCurrentUser(payload.id);
  }

  @Get('images/:image')
  @UseGuards(AuthGuard)
  getProfile(@Param('image') image: string, @Res() res: Response) {
    return res.sendFile(image, { root: './uploads/profile-images' });
  }

  @Get()
  @Roles(UserType.ADMIN)
  @UseGuards(AuthGuard)
  @ResponseMessage('common.users.listRetrieved')
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  @Roles(UserType.ADMIN)
  @UseGuards(AuthRoleGuard)
  @ResponseMessage('common.users.retrieved')
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(+id);
  }

  // PUT/POST have no static/dynamic conflict so order doesn't matter here
  @Put(':id')
  @Roles(UserType.ADMIN, UserType.NORMAL_USER)
  @UseGuards(AuthRoleGuard)
  @ResponseMessage('common.users.updated')
  update(@CurrentUser() payload: JwtPayloadType, @Body() body: UpdateUserDto) {
    return this.usersService.update(payload.id, body);
  }

  @Post('upload-profile-image')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('user-image'))
  @ResponseMessage('users.profileImageUploaded')
  uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    if (!file) throw new BadRequestException('uploads.fileRequired');
    return this.usersService.uploadProfileImage(file.filename, payload.id);
  }

  // TODO: implement
  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    console.log(`endpoint hit: PATCH /users/${id}/toggle-active`);
    return { message: 'User active status toggled placeholder', id };
  }

  // TODO: implement
  @Get('export')
  export() {
    console.log('endpoint hit: GET /users/export');
    return { message: 'Users export placeholder' };
  }
}