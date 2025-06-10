import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'

import {
  ShortenedUrlOutput,
  ShortenedUrlOutputMapper,
} from '../dtos/shortened-url-output'
import { ShortenedUrlRepository } from '@/shortened-url/domain/repositories/shortened-url.repository'
import { BadRequestError } from '@/shared/application/errors/bad-request-error'
import { ShortenedUrlShlinkProvider } from '@/shared/application/providers/shortened-url-shlink.provider'

export namespace UpdateVisitsTotalUseCase {
  export type Input = {
    id: string
    userId: string
    companyId: string
  }

  export type Output = ShortenedUrlOutput

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly shortenedUrlRepository: ShortenedUrlRepository.Repository,
      private readonly shortenedUrlShlinkProvider: ShortenedUrlShlinkProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const { userId, companyId, id } = input

      if (!userId || !companyId || !id) {
        throw new BadRequestError('Input data not provided')
      }

      const entity = await this.shortenedUrlRepository.findById(
        id,
        companyId,
        userId,
      )

      await this.shortenedUrlRepository.runInTransaction(async () => {
        const shortenedUrl =
          await this.shortenedUrlShlinkProvider.getShortUrlVisits(
            entity.shortCode,
          )

        entity.updateProps({
          companyId,
          userId,
          visitsTotal: shortenedUrl.visits.pagination.totalItems,
        })

        await this.shortenedUrlRepository.update(entity)
      })

      return ShortenedUrlOutputMapper.toOutput(entity)
    }
  }
}
