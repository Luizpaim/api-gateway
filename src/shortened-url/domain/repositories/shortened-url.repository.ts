import {
  SearchParams as DefaultSearchParams,
  SearchResult as DefaultSearchResult,
  SearchableRepositoryInterface,
} from '@/shared/domain/repositories/searchable-repository-contracts'
import { ShortenedUrlEntity } from '../entities/shortened-url.entity'

export namespace ShortenedUrlRepository {
  export type Filter = string

  export class SearchParams extends DefaultSearchParams<Filter> {
    companyId: string
    userId: string
  }

  export class SearchResult extends DefaultSearchResult<
    ShortenedUrlEntity,
    Filter
  > {}

  export interface Repository
    extends SearchableRepositoryInterface<
      ShortenedUrlEntity,
      Filter,
      SearchParams,
      SearchResult
    > {
    shortCodeExists(shortCode: string): Promise<void>
  }
}
