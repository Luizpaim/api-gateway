import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { ShortenedUrlRepository } from '@/shortened-url/domain/repositories/shortened-url.repository'

export namespace DeleteShortenedUrlUseCase {
  export type Input = {
    id: string
  }

  export type Output = void

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly shortenedUrlRepository: ShortenedUrlRepository.Repository,
    ) {}

    async execute(input: Input): Promise<Output> {
      await this.shortenedUrlRepository.delete(input.id)
    }
  }
}
