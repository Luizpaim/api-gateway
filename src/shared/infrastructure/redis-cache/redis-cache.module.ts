import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { redisStore } from 'cache-manager-ioredis-yet'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import type { Cache } from 'cache-manager'
import { RedisProvider } from './redis-cache.provider'
import { ConfigModule } from '@nestjs/config/dist/config.module'

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || parseInt('6379'),
          },
        })
        return {
          store: () => store,
        }
      },
    }),
  ],
  providers: [
    {
      provide: 'RedisCacheProvider',
      useFactory: async (cacheManager: Cache) =>
        new RedisProvider(cacheManager),
      inject: [CACHE_MANAGER],
    },
  ],
  exports: ['RedisCacheProvider'],
})
export class RedisCacheModule {}
