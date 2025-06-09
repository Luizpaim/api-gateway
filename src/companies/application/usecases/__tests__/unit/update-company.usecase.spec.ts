import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { BadRequestError } from '@/shared/application/errors/bad-request-error'
import { CompanyEntity } from '@/companies/domain/entities/company.entity'
import { CompanyDataBuilder } from '@/companies/domain/testing/helpers/company-data-builder'
import { CompanyInMemoryRepository } from '@/companies/infrastructure/database/in-memory/repositories/company-in-memory.repository'
import { UpdateCompanyUseCase } from '../../update-company.usecase'

describe('UpdateCompanyUseCase unit tests', () => {
  let sut: UpdateCompanyUseCase.UseCase
  let repository: CompanyInMemoryRepository

  beforeEach(() => {
    repository = new CompanyInMemoryRepository()
    sut = new UpdateCompanyUseCase.UseCase(repository)
  })

  it('Should throws error when entity not found', async () => {
    await expect(() =>
      sut.execute({ id: 'fakeId', name: 'test name' }),
    ).rejects.toThrow(new NotFoundError('Entity not found'))
  })

  it('Should throws error when name not provided', async () => {
    await expect(() => sut.execute({ id: 'fakeId', name: '' })).rejects.toThrow(
      new BadRequestError('Name not provided'),
    )
  })

  it('Should update a company', async () => {
    const spyUpdate = jest.spyOn(repository, 'update')

    const items = [new CompanyEntity(CompanyDataBuilder({}))]
    repository.items = items

    const result = await sut.execute({
      id: items[0]._id,
      name: 'new name',
      category: 'new category',
    })
    expect(spyUpdate).toHaveBeenCalledTimes(1)

    expect(result).toMatchObject({
      id: items[0].id,
      name: 'new name',
      category: 'new category',
      createdAt: items[0].createdAt,
      updatedAt: items[0].updatedAt,
    })
  })
})
