import { BadRequestError } from '../../../shared/application/errors/bad-request-error'
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'

import {
  ShortenedUrlOutput,
  ShortenedUrlOutputMapper,
} from '../dtos/shortened-url-output'
import { ShortenedUrlRepository } from '@/shortened-url/domain/repositories/shortened-url.repository'
import { ShortenedUrlEntity } from '@/shortened-url/domain/entities/shortened-url.entity'

export namespace SignupShortenedUrlUseCase {
  export type Input = {
    companyId?: string
    userId?: string
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
      const { longUrl } = input

      if (!longUrl) {
        throw new BadRequestError('Input data not provided')
      }

      const entity = new ShortenedUrlEntity(
        Object.assign({
          ...input,
          validSince: new Date(input.validSince),
          validUntil: new Date(input.validUntil),
          shortCode: 'teste1',
          shortUrl: 'https://short.url/asddfg',
          longUrl: 'slfkdsjflkj',
        }),
      )

      await this.shortenedUrlRepository.insert(entity)
      const shotenedUrl = ShortenedUrlOutputMapper.toOutput(entity)

      return shotenedUrl
    }
  }
}
