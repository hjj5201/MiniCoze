import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { CurrentUser } from '../../shared/types/current-user.type';
import { UpdateCurrentUserDto } from './dto/update-current-user.dto';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  getMe(@CurrentUserInfo() currentUser: CurrentUser) {
    return this.userService.findCurrentUser(currentUser.id);
  }

  @Patch('me')
  @ApiOperation({ summary: '更新当前用户信息' })
  updateMe(
    @CurrentUserInfo() currentUser: CurrentUser,
    @Body() updateCurrentUserDto: UpdateCurrentUserDto,
  ) {
    return this.userService.updateCurrentUser(
      currentUser.id,
      updateCurrentUserDto,
    );
  }
}
