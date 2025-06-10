import { BadRequestError } from '../../../shared/application/errors/bad-request-error'
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'

import {
  ShortenedUrlOutput,
  ShortenedUrlOutputMapper,
} from '../dtos/shortened-url-output'
import { ShortenedUrlRepository } from '@/shortened-url/domain/repositories/shortened-url.repository'
import { ShortenedUrlEntity } from '@/shortened-url/domain/entities/shortened-url.entity'

import { ShortenedUrlShlinkProvider } from '@/shared/application/providers/shortened-url-shlink.provider'

export namespace SignupShortenedUrlUseCase {
  export type Input = {
    companyId?: string
    userId?: string
    longUrl: string
  }

  export type Output = ShortenedUrlOutput

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly shortenedUrlRepository: ShortenedUrlRepository.Repository,
      private readonly shortenedUrlShlinkProvider: ShortenedUrlShlinkProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const { longUrl } = input

      if (!longUrl) {
        throw new BadRequestError('Input data not provided')
      }

      const shortenedUrl = await this.shortenedUrlShlinkProvider.createShortUrl(
        {
          longUrl,
          shortCodeLength: 6,
          tags: [`${input.userId}`],
        },
      )

      if (!shortenedUrl) {
        throw new BadRequestError('Failed to create shortened URL')
      }

      const entity = new ShortenedUrlEntity(
        Object.assign({
          ...input,
          shortCode: shortenedUrl.shortCode,
          shortUrl: shortenedUrl.shortUrl,
          longUrl: shortenedUrl.longUrl,
        }),
      )

      await this.shortenedUrlRepository.insert(entity)

      const shotenedUrl = ShortenedUrlOutputMapper.toOutput(entity)

      return shotenedUrl
    }
  }
}
