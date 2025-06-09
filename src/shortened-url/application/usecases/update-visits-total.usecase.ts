import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'

import {
  ShortenedUrlOutput,
  ShortenedUrlOutputMapper,
} from '../dtos/shortened-url-output'
import { ShortenedUrlRepository } from '@/shortened-url/domain/repositories/shortened-url.repository'
import { BadRequestError } from '@/shared/application/errors/bad-request-error'

export namespace UpdateVisitsTotalUseCase {
  export type Input = {
    id: string
    userId: string
    companyId: string
    shortCode: string
  }

  export type Output = ShortenedUrlOutput

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly shortenedUrlRepository: ShortenedUrlRepository.Repository,
    ) {}

    async execute(input: Input): Promise<Output> {
      const entity = await this.shortenedUrlRepository.findById(input.id)

      const { userId, companyId, shortCode } = input

      if (!userId || !companyId || !shortCode) {
        throw new BadRequestError('Input data not provided')
      }

      entity.updateProps({
        visitsTotal: 1,
      })

      await this.shortenedUrlRepository.update(entity)

      return ShortenedUrlOutputMapper.toOutput(entity)
    }
  }
}
