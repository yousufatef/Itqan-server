import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Res,
  Patch,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from './guards/auth.guard';
import { AuthRoleGuard } from './guards/auth-role.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserRole } from '../utils/enums';
import { FileInterceptor } from '@nestjs/platform-express';
import type { JwtPayloadType } from '../utils/types';
import type { Response } from 'express';
import { ResponseMessage } from '../utils/decorators/response-message.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // ─── Admin endpoints ──────────────────────────────────────────────────────

  /**
   * GET /users/getPaginatedUsers?page=1&limit=10&role=teacher&searchTerm=ali
   * Paginated list with optional role filter and username/email search
   */
  @Get('getPaginatedUsers')
  @UseGuards(AuthRoleGuard)
  @ResponseMessage('common.users.listRetrieved')
  getPaginatedUsers(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('role') role?: UserRole,
    @Query('searchTerm') searchTerm?: string,
  ) {
    return this.usersService.getPaginatedUsers(
      Math.max(1, parseInt(page, 10) || 1),
      Math.min(100, parseInt(limit, 10) || 10),
      role,
      searchTerm?.trim(),
    );
  }

  /**
   * GET /users/dropdown?role=teacher|parent
   * Lightweight list for dropdowns (id, username only)
   */
  @Get('dropdown')
  @UseGuards(AuthRoleGuard)
  @ResponseMessage('common.users.listRetrieved')
  getDropdown(@Query('role') role?: UserRole) {
    return this.usersService.getDropdownUsers(role);
  }

  /**
   * POST /users/createUser
   * Create a new user (username, email, phoneNumber, role) — default password assigned
   */
  @Post('createUser')
  @UseGuards(AuthRoleGuard)
  @ResponseMessage('common.users.created')
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }

  /**
   * PATCH /users/updateUser/:id
   * Update any user: { username?, email?, phoneNumber?, role? }
   */
  @Patch('updateUser/:id')
  @UseGuards(AuthRoleGuard)
  @ResponseMessage('common.users.updated')
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() body: Omit<AdminUpdateUserDto, 'id'>) {
    return this.usersService.adminUpdateUser({ ...body, id } as AdminUpdateUserDto);
  }

  /**
   * DELETE /users/deleteUser/:id
   * Delete a user by ID passed in params
   */
  @Delete('deleteUser/:id')
  @UseGuards(AuthRoleGuard)
  @ResponseMessage('common.users.deleted')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser({ id });
  }

  /**
   * PATCH /users/statusToggle/:id
   * Toggle isActive flag for a user by ID
   */
  @Patch('statusToggle/:id')
  @UseGuards(AuthRoleGuard)
  @ResponseMessage('common.users.statusToggled')
  statusToggle(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.statusToggle({ id });
  }

  // ─── Profile image endpoints ──────────────────────────────────────────────

  @Delete('images/remove-profile-image')
  @UseGuards(AuthGuard)
  @ResponseMessage('common.users.profileImageRemoved')
  removeProfileImage(@CurrentUser() payload: JwtPayloadType) {
    return this.usersService.removeProfileImage(payload.id);
  }

  @Get('images/:image')
  @UseGuards(AuthGuard)
  getProfile(@Param('image') image: string, @Res() res: Response) {
    return res.sendFile(image, { root: './uploads/profile-images' });
  }

  @Post('upload-profile-image')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('user-image'))
  @ResponseMessage('common.users.profileImageUploaded')
  uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    if (!file) throw new BadRequestException('uploads.fileRequired');
    return this.usersService.uploadProfileImage(file.filename, payload.id);
  }

  // ─── Auth-user profile endpoint ───────────────────────────────────────────

  @Get('profile')
  @UseGuards(AuthGuard)
  @ResponseMessage('common.users.retrieved')
  getCurrentUser(@CurrentUser() payload: JwtPayloadType) {
    return this.usersService.getCurrentUser(payload.id);
  }

  // ─── Generic CRUD (kept for backwards compatibility) ─────────────────────

  @Get()
  @UseGuards(AuthRoleGuard)
  @ResponseMessage('common.users.listRetrieved')
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  @UseGuards(AuthRoleGuard)
  @ResponseMessage('common.users.retrieved')
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(+id);
  }

  @Put(':id')
  @UseGuards(AuthRoleGuard)
  @ResponseMessage('common.users.updated')
  update(@CurrentUser() payload: JwtPayloadType, @Body() body: UpdateUserDto) {
    return this.usersService.update(payload.id, body);
  }

  @Delete(':id')
  @UseGuards(AuthRoleGuard)
  @ResponseMessage('common.users.deleted')
  remove(@CurrentUser() payload: JwtPayloadType) {
    return this.usersService.remove(payload.id);
  }
}
