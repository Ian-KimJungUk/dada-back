import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

/**
 * ioredis 클라이언트를 확장한 서비스.
 * REDIS_URL을 ConfigService로 주입받아 연결하며,
 * 애플리케이션 종료 시 연결을 정리한다.
 */
@Injectable()
export class RedisService
  extends Redis
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisService.name);

  constructor(config: ConfigService) {
    super(config.getOrThrow<string>('REDIS_URL'), {
      // 커넥션 실패 시 명령이 무한 대기하지 않도록 재시도 상한을 둔다.
      maxRetriesPerRequest: 3,
    });
  }

  onModuleInit() {
    this.on('error', (err) => this.logger.error('Redis 연결 오류', err));
    this.on('connect', () => this.logger.log('Redis 연결됨'));
  }

  async onModuleDestroy() {
    await this.quit();
  }
}
