import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { EventsGateway } from './events.gateway';

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  let server: { emit: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsGateway],
    }).compile();

    gateway = module.get(EventsGateway);
    server = { emit: jest.fn() };
    // @WebSocketServer()로 주입되는 서버를 테스트용 목으로 대체
    gateway.server = server as unknown as Server;
  });

  it('정의되어 있다', () => {
    expect(gateway).toBeDefined();
  });

  it('ping → { event: "pong", data: "pong" } 반환', () => {
    expect(gateway.handlePing()).toEqual({ event: 'pong', data: 'pong' });
  });

  it('message → 모든 클라이언트에게 {from, data} broadcast', () => {
    const client = { id: 'socket-1' } as Socket;

    gateway.handleMessage('hello', client);

    expect(server.emit).toHaveBeenCalledWith('message', {
      from: 'socket-1',
      data: 'hello',
    });
  });

  it('연결/해제 핸들러가 예외 없이 동작한다', () => {
    const client = { id: 'socket-2' } as Socket;
    expect(() => gateway.handleConnection(client)).not.toThrow();
    expect(() => gateway.handleDisconnect(client)).not.toThrow();
  });
});
