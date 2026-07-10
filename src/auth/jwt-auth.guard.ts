import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Bearer 토큰을 검증하는 가드. 보호 라우트에 @UseGuards(JwtAuthGuard)로 적용.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
