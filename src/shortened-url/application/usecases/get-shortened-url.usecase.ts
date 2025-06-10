import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { RedisCacheProvider } from '@/shared/application/providers/redis-cache.provider'
import {
  ShortenedUrlOutput,
  ShortenedUrlOutputMapper,
} from '../dtos/shortened-url-output'
import { ShortenedUrlRepository } from '@/shortened-url/domain/repositories/shortened-url.repository'

export namespace GetShortenedUrlUseCase {
  export type Input = {
    id: string
    companyId: string
    userId: string
  }

  export type Output = ShortenedUrlOutput

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly shortenedUrlRepository: ShortenedUrlRepository.Repository,
      private readonly redisCacheProvider: RedisCacheProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const cacheKey = `shortened-url:${input.id}`

      const shortenedUrlCached =
        await this.redisCacheProvider.getCache<ShortenedUrlOutput>(cacheKey)

      if (shortenedUrlCached) return shortenedUrlCached

      const entity = await this.shortenedUrlRepository.findById(
        input.id,
        input.companyId,
        input.userId,
      )

      const shortenedUrl = ShortenedUrlOutputMapper.toOutput(entity)

      await this.redisCacheProvider.setCache({
        cacheKey,
        data: shortenedUrl,
        time: 60,
      })

      return shortenedUrl
    }
  }
}
