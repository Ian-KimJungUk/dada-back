import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * auth e2e — 실제 DB에 연결해 익명 인증 흐름을 검증한다.
 * 실행 전 `docker compose up -d`로 DB가 떠 있어야 한다.
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    prisma = app.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  const server = () => app.getHttpServer();

  it('POST /auth/anonymous → 201, 토큰+userId 발급', async () => {
    const res = await request(server()).post('/auth/anonymous').expect(201);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.userId).toEqual(expect.any(String));
  });

  it('GET /auth/me → 토큰 없으면 401', async () => {
    await request(server()).get('/auth/me').expect(401);
  });

  it('GET /auth/me → 발급받은 토큰으로 200, 사용자 정보 반환', async () => {
    const { body } = await request(server())
      .post('/auth/anonymous')
      .expect(201);

    const res = await request(server())
      .get('/auth/me')
      .set('Authorization', `Bearer ${body.accessToken}`)
      .expect(200);

    expect(res.body).toEqual({ userId: body.userId, isAnonymous: true });
  });

  it('GET /auth/me → 잘못된 토큰이면 401', async () => {
    await request(server())
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid.token.here')
      .expect(401);
  });
});
