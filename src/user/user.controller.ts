import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import {
  UpdateEmailRequestDto,
  UpdatePasswordRequestDto,
  UpdatePreferencesRequestDto,
  UserEventsSuggestionsResponseDto,
  UserResponseDto,
  UserUpdateResponseDto,
} from './dto';

@ApiTags('User')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({ description: 'Get all user infos', type: UserResponseDto })
  @ApiBearerAuth()
  @Get()
  async getUserInfos(@Req() req: any) {
    return this.userService.getUserInfos(req.user.id);
  }

  @ApiOkResponse({
    description: 'Get user suggestions',
    type: UserEventsSuggestionsResponseDto,
  })
  @ApiBearerAuth()
  @Get('/suggestions')
  async getUserSuggestions(@Req() req: any) {
    return this.userService.getUserSuggestions(req.user.id);
  }

  @ApiOkResponse({
    description: 'Update user password',
    type: UserUpdateResponseDto,
  })
  @ApiBearerAuth()
  @Patch('/updatePassword')
  async updatePassword(
    @Body() body: UpdatePasswordRequestDto,
    @Req() req: any,
  ) {
    return this.userService.updatePassword(
      req.user.id,
      body.oldPassword,
      body.newPassword,
    );
  }

  @ApiOkResponse({
    description: 'Update user email',
    type: UserUpdateResponseDto,
  })
  @ApiBearerAuth()
  @Patch('/updateEmail')
  async updateEmail(@Body() body: UpdateEmailRequestDto, @Req() req: any) {
    return this.userService.updateEmail(req.user.id, body.email);
  }

  @ApiOkResponse({
    description: 'Update user preferences',
    type: UserUpdateResponseDto,
  })
  @ApiBearerAuth()
  @Patch('/updatePreferences')
  async updatePreferences(
    @Body() body: UpdatePreferencesRequestDto,
    @Req() req: any,
  ) {
    return this.userService.updatePreferences(req.user.id, body.preferences);
  }

  @ApiOkResponse({
    description: 'Delete user account',
    type: UserUpdateResponseDto,
  })
  @ApiBearerAuth()
  @Delete('/deleteAccount')
  async deleteAccount(@Req() req: any) {
    return this.userService.deleteAccount(req.user.id);
  }
}
