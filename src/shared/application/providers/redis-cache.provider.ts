export interface RedisCacheProvider {
  getCache<T>(cacheKey: string): Promise<T>
  setCache<T>(params: {
    cacheKey: string
    data: T
    time: number
  }): Promise<void>
  delCache(cacheKey: string): Promise<void>
}
