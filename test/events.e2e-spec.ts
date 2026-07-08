import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AddressInfo } from 'net';
import { io, Socket } from 'socket.io-client';
import { EventsModule } from './../src/events/events.module';

/**
 * 게이트웨이 e2e — 실제 socket.io 서버를 띄우고 클라이언트로 연결/이벤트를 검증한다.
 * EventsModule만 로드하므로 DB/Redis 없이 독립 실행된다.
 */
describe('EventsGateway (e2e)', () => {
  let app: INestApplication;
  let url: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EventsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(0); // 임의 포트
    const { port } = app.getHttpServer().address() as AddressInfo;
    url = `http://localhost:${port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  const connect = (): Socket =>
    io(url, { transports: ['websocket'], forceNew: true });

  it('클라이언트가 연결된다', (done) => {
    const client = connect();
    client.on('connect', () => {
      expect(client.id).toBeDefined();
      client.close();
      done();
    });
    client.on('connect_error', done);
  });

  it('ping → pong 이벤트를 받는다', (done) => {
    const client = connect();
    client.on('connect', () => client.emit('ping'));
    client.on('pong', (data) => {
      expect(data).toBe('pong');
      client.close();
      done();
    });
    client.on('connect_error', done);
  });

  it('message → {from, data} 로 broadcast 된다', (done) => {
    const client = connect();
    client.on('connect', () => client.emit('message', 'hello-e2e'));
    client.on('message', (payload) => {
      expect(payload).toEqual({ from: client.id, data: 'hello-e2e' });
      client.close();
      done();
    });
    client.on('connect_error', done);
  });
});
