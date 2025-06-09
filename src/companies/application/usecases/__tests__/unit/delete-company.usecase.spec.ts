import { CompanyEntity } from '@/companies/domain/entities/company.entity'
import { CompanyDataBuilder } from '@/companies/domain/testing/helpers/company-data-builder'
import { CompanyInMemoryRepository } from '@/companies/infrastructure/database/in-memory/repositories/company-in-memory.repository'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { DeleteCompanyUseCase } from '../../delete-company.usecase'

describe('DeleteCompanyUseCase unit tests', () => {
  let sut: DeleteCompanyUseCase.UseCase
  let repository: CompanyInMemoryRepository

  beforeEach(() => {
    repository = new CompanyInMemoryRepository()
    sut = new DeleteCompanyUseCase.UseCase(repository)
  })

  it('Should throws error when entity not found', async () => {
    await expect(() => sut.execute({ id: 'fakeId' })).rejects.toThrow(
      new NotFoundError('Entity not found'),
    )
  })

  it('Should delete a company', async () => {
    const spyDelete = jest.spyOn(repository, 'delete')
    const items = [new CompanyEntity(CompanyDataBuilder({}))]
    repository.items = items

    expect(repository.items).toHaveLength(1)
    await sut.execute({ id: items[0]._id })
    expect(spyDelete).toHaveBeenCalledTimes(1)
    expect(repository.items).toHaveLength(0)
  })
})
