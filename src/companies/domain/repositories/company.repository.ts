import {
  SearchParams as DefaultSearchParams,
  SearchResult as DefaultSearchResult,
  SearchableRepositoryInterface,
} from '@/shared/domain/repositories/searchable-repository-contracts'
import { CompanyEntity } from '../entities/company.entity'

export namespace CompanyRepository {
  export type Filter = string

  export class SearchParams extends DefaultSearchParams<Filter> {}

  export class SearchResult extends DefaultSearchResult<
    CompanyEntity,
    Filter
  > {}

  export interface Repository
    extends SearchableRepositoryInterface<
      CompanyEntity,
      Filter,
      SearchParams,
      SearchResult
    > {
    nameExists(name: string): Promise<void>
  }
}
