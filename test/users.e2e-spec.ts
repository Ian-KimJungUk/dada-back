import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

/**
 * users e2e — 실제 PostgreSQL(docker compose)에 연결해 전체 HTTP 흐름을 검증한다.
 * 실행 전 `docker compose up -d`로 DB가 떠 있어야 한다.
 */
describe('Users (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // main.ts와 동일한 전역 파이프를 적용해 실제 동작과 일치시킨다.
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

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  const server = () => app.getHttpServer();

  it('POST /users → 201 생성', async () => {
    const res = await request(server())
      .post('/users')
      .send({ email: 'alice@ex.com', name: 'Alice' })
      .expect(201);

    expect(res.body).toMatchObject({ email: 'alice@ex.com', name: 'Alice' });
    expect(res.body.id).toEqual(expect.any(Number));
  });

  it('POST /users → 400 검증 실패(잘못된 이메일 + 미허용 필드)', async () => {
    await request(server())
      .post('/users')
      .send({ email: 'not-an-email', foo: 'bar' })
      .expect(400);
  });

  it('POST /users → 409 이메일 중복', async () => {
    await request(server())
      .post('/users')
      .send({ email: 'dup@ex.com' })
      .expect(201);
    await request(server())
      .post('/users')
      .send({ email: 'dup@ex.com' })
      .expect(409);
  });

  it('GET /users → 200 목록', async () => {
    await request(server()).post('/users').send({ email: 'a@ex.com' });
    await request(server()).post('/users').send({ email: 'b@ex.com' });

    const res = await request(server()).get('/users').expect(200);
    expect(res.body).toHaveLength(2);
  });

  it('GET /users/:id → 200 / 404', async () => {
    const created = await request(server())
      .post('/users')
      .send({ email: 'one@ex.com' });
    const id = created.body.id;

    await request(server()).get(`/users/${id}`).expect(200);
    await request(server()).get('/users/999999').expect(404);
  });

  it('PATCH /users/:id → 200 수정', async () => {
    const created = await request(server())
      .post('/users')
      .send({ email: 'patch@ex.com', name: 'Old' });
    const id = created.body.id;

    const res = await request(server())
      .patch(`/users/${id}`)
      .send({ name: 'New' })
      .expect(200);

    expect(res.body.name).toBe('New');
  });

  it('DELETE /users/:id → 204 후 404', async () => {
    const created = await request(server())
      .post('/users')
      .send({ email: 'del@ex.com' });
    const id = created.body.id;

    await request(server()).delete(`/users/${id}`).expect(204);
    await request(server()).get(`/users/${id}`).expect(404);
  });
});
