import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { RedisCacheProvider } from '@/shared/application/providers/redis-cache.provider'
import { CompanyEntity } from '@/companies/domain/entities/company.entity'
import { CompanyDataBuilder } from '@/companies/domain/testing/helpers/company-data-builder'
import { CompanyInMemoryRepository } from '@/companies/infrastructure/database/in-memory/repositories/company-in-memory.repository'
import { GetCompanyUseCase } from '../../getcompany.usecase'

describe('GetCompanyUseCase unit tests', () => {
  let sut: GetCompanyUseCase.UseCase
  let repository: CompanyInMemoryRepository
  let redisCacheProvider: RedisCacheProvider

  beforeEach(() => {
    repository = new CompanyInMemoryRepository()

    redisCacheProvider = {
      getCache: jest.fn(),
      setCache: jest.fn(),
      delCache: jest.fn(),
    }

    sut = new GetCompanyUseCase.UseCase(repository, redisCacheProvider)
  })

  it('Should throws error when entity not found', async () => {
    await expect(() => sut.execute({ id: 'fakeId' })).rejects.toThrow(
      new NotFoundError('Entity not found'),
    )
  })

  it('Should be able to get company profile', async () => {
    const spyFindById = jest.spyOn(repository, 'findById')
    const items = [new CompanyEntity(CompanyDataBuilder({}))]
    repository.items = items

    const result = await sut.execute({ id: items[0]._id })
    expect(spyFindById).toHaveBeenCalledTimes(1)
    expect(result).toMatchObject({
      id: items[0].id,
      name: items[0].name,
      category: items[0].category,
      createdAt: items[0].createdAt,
      updatedAt: items[0].updatedAt,
      deletedAt: items[0].deletedAt,
    })
  })
})
