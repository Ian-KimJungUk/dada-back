import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './events/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // socket.io를 Redis 백플레인에 연결 (다중 인스턴스 간 broadcast 전파)
  const config = app.get(ConfigService);
  const redisIoAdapter = new RedisIoAdapter(
    app,
    config.getOrThrow<string>('REDIS_URL'),
  );
  redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
