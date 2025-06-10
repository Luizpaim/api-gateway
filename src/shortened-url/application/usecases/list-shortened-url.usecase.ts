import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { SearchInput } from '@/shared/application/dtos/search-input'
import {
  PaginationOutput,
  PaginationOutputMapper,
} from '@/shared/application/dtos/pagination-output'
import { ShortenedUrlRepository } from '@/shortened-url/domain/repositories/shortened-url.repository'
import {
  ShortenedUrlOutput,
  ShortenedUrlOutputMapper,
} from '../dtos/shortened-url-output'

export namespace ListShortenedUrlUseCase {
  export type Input = SearchInput & {
    companyId: string
    userId: string
  }

  export type Output = PaginationOutput<ShortenedUrlOutput>

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly shortenedUrlRepository: ShortenedUrlRepository.Repository,
    ) {}

    async execute(input: Input): Promise<Output> {
      const params = new ShortenedUrlRepository.SearchParams(input)
      const searchResult = await this.shortenedUrlRepository.search(params)
      return this.toOutput(searchResult)
    }

    private toOutput(
      searchResult: ShortenedUrlRepository.SearchResult,
    ): Output {
      const items = searchResult.items.map(item => {
        return ShortenedUrlOutputMapper.toOutput(item)
      })
      return PaginationOutputMapper.toOutput(items, searchResult)
    }
  }
}
