import { RedisCacheProvider } from '@/shared/application/providers/redis-cache.provider'
import { Logger } from '@nestjs/common'
import type { Cache } from 'cache-manager'

export class RedisProvider implements RedisCacheProvider {
  private readonly logger = new Logger('RedisCacheProvider')

  constructor(private readonly cacheManager: Cache) {}

  public async getCache<T>(cacheKey: string): Promise<T> {
    try {
      const value = await this.cacheManager.get<T>(cacheKey)
      this.logger.log('Return cached:', cacheKey)
      return value ?? null
    } catch (error) {
      this.logger.error('Error return cached:', error)
    }
  }

  public async setCache<T>({
    cacheKey,
    data,
  }: {
    cacheKey: string
    data: T
    time: number
  }): Promise<void> {
    try {
      await this.cacheManager.set(cacheKey, data)
      this.logger.log('Set cached:', cacheKey)
    } catch (error) {
      this.logger.error('Error set cached:', error)
    }
  }

  public async delCache(cacheKey: string): Promise<void> {
    try {
      await this.cacheManager.del(cacheKey)
      this.logger.log('Del cached:', cacheKey)
    } catch (error) {
      this.logger.error('Error del cached:', error)
    }
  }
}
