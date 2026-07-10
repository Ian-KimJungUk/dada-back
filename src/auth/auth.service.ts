import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // 익명(게스트) 사용자를 생성하고 액세스 토큰을 발급한다.
  async createAnonymous(): Promise<{ accessToken: string; userId: string }> {
    const user = await this.prisma.user.create({ data: { isAnonymous: true } });
    const payload: JwtPayload = { sub: user.id, isAnonymous: true };
    const accessToken = await this.jwt.signAsync(payload);
    return { accessToken, userId: user.id };
  }
}
