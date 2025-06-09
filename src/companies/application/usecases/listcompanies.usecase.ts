import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { SearchInput } from '@/shared/application/dtos/search-input'
import {
  PaginationOutput,
  PaginationOutputMapper,
} from '@/shared/application/dtos/pagination-output'
import { CompanyRepository } from '@/companies/domain/repositories/company.repository'
import { CompanyOutput, CompanyOutputMapper } from '../dtos/company-output'

export namespace ListCompaniesUseCase {
  export type Input = SearchInput

  export type Output = PaginationOutput<CompanyOutput>

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly companyRepository: CompanyRepository.Repository,
    ) {}

    async execute(input: Input): Promise<Output> {
      const params = new CompanyRepository.SearchParams(input)
      const searchResult = await this.companyRepository.search(params)
      return this.toOutput(searchResult)
    }

    private toOutput(searchResult: CompanyRepository.SearchResult): Output {
      const items = searchResult.items.map(item => {
        return CompanyOutputMapper.toOutput(item)
      })
      return PaginationOutputMapper.toOutput(items, searchResult)
    }
  }
}
