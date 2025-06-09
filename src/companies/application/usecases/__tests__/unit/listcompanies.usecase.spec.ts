import { CompanyEntity } from '@/companies/domain/entities/company.entity'
import { CompanyRepository } from '@/companies/domain/repositories/company.repository'
import { CompanyDataBuilder } from '@/companies/domain/testing/helpers/company-data-builder'
import { CompanyInMemoryRepository } from '@/companies/infrastructure/database/in-memory/repositories/company-in-memory.repository'
import { ListCompaniesUseCase } from '../../listcompanies.usecase'

describe('ListCompaniesUseCase unit tests', () => {
  let sut: ListCompaniesUseCase.UseCase
  let repository: CompanyInMemoryRepository

  beforeEach(() => {
    repository = new CompanyInMemoryRepository()
    sut = new ListCompaniesUseCase.UseCase(repository)
  })

  it('toOutput method', () => {
    let result = new CompanyRepository.SearchResult({
      items: [],
      total: 1,
      currentPage: 1,
      perPage: 2,
      sort: null,
      sortDir: null,
      filter: null,
    })
    let output = sut['toOutput'](result)
    expect(output).toStrictEqual({
      items: [],
      total: 1,
      currentPage: 1,
      lastPage: 1,
      perPage: 2,
    })

    const entity = new CompanyEntity(CompanyDataBuilder({}))
    result = new CompanyRepository.SearchResult({
      items: [entity],
      total: 1,
      currentPage: 1,
      perPage: 2,
      sort: null,
      sortDir: null,
      filter: null,
    })
    output = sut['toOutput'](result)
    expect(output).toStrictEqual({
      items: [entity.toJSON()],
      total: 1,
      currentPage: 1,
      lastPage: 1,
      perPage: 2,
    })
  })

  it('should return the users ordered by createdAt', async () => {
    const createdAt = new Date()
    const items = [
      new CompanyEntity(CompanyDataBuilder({ createdAt })),
      new CompanyEntity(
        CompanyDataBuilder({ createdAt: new Date(createdAt.getTime() + 1) }),
      ),
    ]
    repository.items = items
    const output = await sut.execute({})
    expect(output).toStrictEqual({
      items: [...items].reverse().map(item => item.toJSON()),
      total: 2,
      currentPage: 1,
      lastPage: 1,
      perPage: 15,
    })
  })

  it('should return the users using pagination, sort and filter', async () => {
    const items = [
      new CompanyEntity(CompanyDataBuilder({ name: 'a' })),
      new CompanyEntity(CompanyDataBuilder({ name: 'AA' })),
      new CompanyEntity(CompanyDataBuilder({ name: 'Aa' })),
      new CompanyEntity(CompanyDataBuilder({ name: 'b' })),
      new CompanyEntity(CompanyDataBuilder({ name: 'c' })),
    ]
    repository.items = items
    let output = await sut.execute({
      page: 1,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: 'a',
    })
    expect(output).toStrictEqual({
      items: [items[1].toJSON(), items[2].toJSON()],
      total: 3,
      currentPage: 1,
      lastPage: 2,
      perPage: 2,
    })

    output = await sut.execute({
      page: 2,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: 'a',
    })
    expect(output).toStrictEqual({
      items: [items[0].toJSON()],
      total: 3,
      currentPage: 2,
      lastPage: 2,
      perPage: 2,
    })

    output = await sut.execute({
      page: 1,
      perPage: 3,
      sort: 'name',
      sortDir: 'desc',
      filter: 'a',
    })
    expect(output).toStrictEqual({
      items: [items[0].toJSON(), items[2].toJSON(), items[1].toJSON()],
      total: 3,
      currentPage: 1,
      lastPage: 1,
      perPage: 3,
    })
  })
})
