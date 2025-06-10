import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { BadRequestError } from '@/shared/application/errors/bad-request-error'
import {
  ShortenedUrlOutput,
  ShortenedUrlOutputMapper,
} from '../dtos/shortened-url-output'
import { ShortenedUrlRepository } from '@/shortened-url/domain/repositories/shortened-url.repository'
import { ShortenedUrlShlinkProvider } from '@/shared/application/providers/shortened-url-shlink.provider'

export namespace UpdateShortenedUrlUseCase {
  export type Input = {
    id: string
    companyId: string
    userId: string
    longUrl: string
    validSince?: Date
    validUntil?: Date
    maxVisits?: number
  }

  export type Output = ShortenedUrlOutput

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly shortenedUrlRepository: ShortenedUrlRepository.Repository,
      private readonly shortenedUrlShlinkProvider: ShortenedUrlShlinkProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const { companyId, userId, longUrl } = input

      if (!companyId || !userId || !longUrl) {
        throw new BadRequestError('Params not provided')
      }

      const entity = await this.shortenedUrlRepository.findById(
        input.id,
        companyId,
        userId,
      )

      await this.shortenedUrlRepository.runInTransaction(async () => {
        const shortenedUrl = await this.shortenedUrlShlinkProvider.editShortUrl(
          entity.shortCode,
          {
            longUrl,
          },
        )

        entity.updateProps({
          companyId,
          userId,
          longUrl: shortenedUrl.longUrl,
          shortUrl: shortenedUrl.shortUrl,
          shortCode: shortenedUrl.shortCode,
        })

        await this.shortenedUrlRepository.update(entity)
      })

      return ShortenedUrlOutputMapper.toOutput(entity)
    }
  }
}
