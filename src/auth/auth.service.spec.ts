import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let userCreate: jest.Mock;
  let jwtSign: jest.Mock;

  beforeEach(async () => {
    userCreate = jest.fn();
    jwtSign = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: { user: { create: userCreate } } },
        { provide: JwtService, useValue: { signAsync: jwtSign } },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('익명 사용자를 생성하고 토큰을 발급한다', async () => {
    userCreate.mockResolvedValue({ id: 'uuid-1', isAnonymous: true });
    jwtSign.mockResolvedValue('signed.jwt.token');

    const result = await service.createAnonymous();

    expect(userCreate).toHaveBeenCalledWith({ data: { isAnonymous: true } });
    expect(jwtSign).toHaveBeenCalledWith({ sub: 'uuid-1', isAnonymous: true });
    expect(result).toEqual({
      accessToken: 'signed.jwt.token',
      userId: 'uuid-1',
    });
  });
});
