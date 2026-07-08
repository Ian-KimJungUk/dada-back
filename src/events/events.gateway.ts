import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { WsResponse } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * socket.io 기반 게이트웨이.
 * 연결/해제 로깅과 두 가지 이벤트 핸들러(ping, message)를 제공한다.
 */
@WebSocketGateway({
  cors: { origin: '*' },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log('WebSocket 게이트웨이 초기화 완료');
  }

  handleConnection(client: Socket) {
    this.logger.log(`클라이언트 연결: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`클라이언트 해제: ${client.id}`);
  }

  /**
   * ack(반환값) 방식: 클라이언트의 emit 콜백으로 즉시 응답한다.
   */
  @SubscribeMessage('ping')
  handlePing(): WsResponse<string> {
    return { event: 'pong', data: 'pong' };
  }

  /**
   * broadcast 방식: 받은 메시지를 모든 클라이언트에게 'message'로 전파한다.
   */
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log(`message 수신 [${client.id}]: ${data}`);
    this.server.emit('message', { from: client.id, data });
  }
}
