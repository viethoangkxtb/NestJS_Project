import {Body, Controller, Get, Post, Req, Res, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {Public, ResponseMessage, User} from 'src/decorator/customize';
import {LocalAuthGuard} from './local-auth.guard';
import {
  ChangePasswordDto,
  RegisterUserDto,
  UserLoginDto,
} from 'src/users/dto/create-user.dto';
import {Request, Response} from 'express';
import {IUser} from 'src/users/users.interface';
import {RolesService} from 'src/roles/roles.service';
import {ThrottlerGuard} from '@nestjs/throttler';
import {ApiBody, ApiTags} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private rolesService: RolesService,
  ) {}

  @Public()
  @ResponseMessage('User login')
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @ApiBody({type: UserLoginDto})
  @Post('/login')
  handleLogin(@Req() req, @Res({passthrough: true}) response: Response) {
    return this.authService.login(req.user, response);
  }

  @Public()
  @ResponseMessage('Register a new user')
  @Post('/register')
  handleRegister(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @ResponseMessage('Register a new user')
  @Post('/change-password')
  handleChangePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @User() user: IUser,
  ) {
    return this.authService.changePassword(changePasswordDto, user);
  }

  @ResponseMessage('Get User information')
  @Get('/account')
  async handleGetAccount(@User() user: IUser) {
    const temp = (await this.rolesService.findOne(user.role._id)) as any;
    user.permissions = temp.permissions;
    return {user};
  }

  @Public()
  @ResponseMessage('Get User by refresh token')
  @Get('/refresh')
  handleRefreshToken(
    @Req() request: Request,
    @Res({passthrough: true}) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    return this.authService.processNewToken(refreshToken, response);
  }

  @ResponseMessage('Logout User')
  @Post('/logout')
  handleLogout(
    @User() user: IUser,
    @Res({passthrough: true}) response: Response,
  ) {
    return this.authService.logout(user, response);
  }
}
