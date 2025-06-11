import { ShortenedUrlShlinkProvider } from '@/shared/application/providers/shortened-url-shlink.provider'
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { ShortenedUrlRepository } from '@/shortened-url/domain/repositories/shortened-url.repository'

export namespace DeleteShortenedUrlUseCase {
  export type Input = {
    id: string
    companyId: string
    userId: string
  }

  export type Output = void

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly shortenedUrlRepository: ShortenedUrlRepository.Repository,
      private readonly shortenedUrlShlinkProvider: ShortenedUrlShlinkProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const entity = await this.shortenedUrlRepository.findById(
        input.id,
        input.companyId,
        input.userId,
      )

      this.shortenedUrlRepository.runInTransaction(async () => {
        await this.shortenedUrlRepository.delete(
          input.id,
          input.companyId,
          input.userId,
        )

        await this.shortenedUrlShlinkProvider.deleteShortUrl(entity.shortCode)
      })
    }
  }
}
