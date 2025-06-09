import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { InMemorySearchableRepository } from '@/shared/domain/repositories/in-memory-searchable.repository'
import { SortDirection } from '@/shared/domain/repositories/searchable-repository-contracts'
import { ShortenedUrlEntity } from '@/shortened-url/domain/entities/shortened-url.entity'
import { ShortenedUrlRepository } from '@/shortened-url/domain/repositories/shortened-url.repository'

export class ShortenedUrlInMemoryRepository
  extends InMemorySearchableRepository<ShortenedUrlEntity>
  implements ShortenedUrlRepository.Repository
{
  sortableFields: string[] = ['name', 'createdAt']

  async shortCodeExists(shortCode: string): Promise<void> {
    const entity = this.items.find(item => item.shortCode === shortCode)
    if (entity) {
      throw new ConflictError('ShortCode address already used')
    }
  }

  protected async applyFilter(
    items: ShortenedUrlEntity[],
    filter: ShortenedUrlRepository.Filter,
  ): Promise<ShortenedUrlEntity[]> {
    if (!filter) {
      return items
    }
    return items.filter(item => {
      return item.props.shortUrl.toLowerCase().includes(filter.toLowerCase())
    })
  }

  protected async applySort(
    items: ShortenedUrlEntity[],
    sort: string | null,
    sortDir: SortDirection | null,
  ): Promise<ShortenedUrlEntity[]> {
    return !sort
      ? super.applySort(items, 'createdAt', 'desc')
      : super.applySort(items, sort, sortDir)
  }
}
