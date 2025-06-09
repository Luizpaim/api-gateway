import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { BadRequestError } from '@/shared/application/errors/bad-request-error'
import {
  ShortenedUrlOutput,
  ShortenedUrlOutputMapper,
} from '../dtos/shortened-url-output'
import { ShortenedUrlRepository } from '@/shortened-url/domain/repositories/shortened-url.repository'

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
    ) {}

    async execute(input: Input): Promise<Output> {
      const { companyId, userId, longUrl } = input

      if (!companyId || !userId || !longUrl) {
        throw new BadRequestError('Name not provided')
      }

      const entity = await this.shortenedUrlRepository.findById(input.id)

      entity.updateProps({
        companyId,
        userId,
        longUrl,
        validSince: input.validSince,
        validUntil: input.validUntil,
        maxVisits: input.maxVisits,
      })

      await this.shortenedUrlRepository.update(entity)

      return ShortenedUrlOutputMapper.toOutput(entity)
    }
  }
}
