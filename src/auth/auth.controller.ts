import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import {
  LoginSuccessDto,
  LoginErrorDto,
  LoginBodyDto,
  SignupResponseDto,
  SignupRequestDto,
} from './dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({
    description: 'Login successful',
    type: LoginSuccessDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad credentials',
    type: LoginErrorDto,
  })
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  async signIn(@Body() body: LoginBodyDto) {
    if (!body.username || !body.password) {
      throw new BadRequestException({
        success: false,
        message: 'Bad credentials',
      });
    }

    const token = await this.authService.signIn(body);
    if (!token) {
      throw new BadRequestException({
        success: false,
        message: 'Bad credentials',
      });
    }

    return {
      success: true,
      token,
    };
  }

  @ApiCreatedResponse({
    description: 'Signup successful',
    type: SignupResponseDto,
  })
  @Post('signup')
  async signUp(@Body() body: SignupRequestDto) {
    if (!body.username || !body.password || !body.email) {
      throw new BadRequestException({
        success: false,
        message: 'Bad credentials',
      });
    }

    const token = await this.authService.signUp(body);
    if (!token) {
      throw new BadRequestException({
        success: false,
        message: 'Bad credentials',
      });
    }

    return {
      success: true,
      token,
    };
  }
}
