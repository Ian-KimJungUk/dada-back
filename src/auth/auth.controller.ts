import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthUser } from './jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 익명 사용자 생성 + 토큰 발급
  @Post('anonymous')
  @HttpCode(HttpStatus.CREATED)
  createAnonymous() {
    return this.authService.createAnonymous();
  }

  // 현재 토큰의 사용자 정보 (가드 동작 확인용)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}
