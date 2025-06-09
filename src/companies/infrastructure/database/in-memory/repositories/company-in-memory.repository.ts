import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { InMemorySearchableRepository } from '@/shared/domain/repositories/in-memory-searchable.repository'
import { SortDirection } from '@/shared/domain/repositories/searchable-repository-contracts'
import { CompanyEntity } from '@/companies/domain/entities/company.entity'
import { CompanyRepository } from '@/companies/domain/repositories/company.repository'

export class CompanyInMemoryRepository
  extends InMemorySearchableRepository<CompanyEntity>
  implements CompanyRepository.Repository
{
  sortableFields: string[] = [
    'name',
    'category',
    'createdAt',
    'updatedAt',
    'deletedAt',
  ]

  async nameExists(name: string): Promise<void> {
    const entity = this.items.find(item => item.name === name)
    if (entity) {
      throw new ConflictError('Name address already used')
    }
  }

  protected async applyFilter(
    items: CompanyEntity[],
    filter: CompanyRepository.Filter,
  ): Promise<CompanyEntity[]> {
    if (!filter) {
      return items
    }
    return items.filter(item => {
      return item.props.name.toLowerCase().includes(filter.toLowerCase())
    })
  }

  protected async applySort(
    items: CompanyEntity[],
    sort: string | null,
    sortDir: SortDirection | null,
  ): Promise<CompanyEntity[]> {
    return !sort
      ? super.applySort(items, 'createdAt', 'desc')
      : super.applySort(items, sort, sortDir)
  }
}
