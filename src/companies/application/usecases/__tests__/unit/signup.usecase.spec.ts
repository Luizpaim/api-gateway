import { SignupUseCase } from '../../signup.usecase'
import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { BadRequestError } from '@/shared/application/errors/bad-request-error'
import { CompanyDataBuilder } from '@/companies/domain/testing/helpers/company-data-builder'
import { CompanyInMemoryRepository } from '@/companies/infrastructure/database/in-memory/repositories/company-in-memory.repository'

describe('SignupUseCase unit tests', () => {
  let sut: SignupUseCase.UseCase
  let repository: CompanyInMemoryRepository

  beforeEach(() => {
    repository = new CompanyInMemoryRepository()

    sut = new SignupUseCase.UseCase(repository)
  })

  it('Should create a company', async () => {
    const spyInsert = jest.spyOn(repository, 'insert')
    const props = CompanyDataBuilder({})
    const result = await sut.execute({
      name: props.name,
      category: props.category,
    })
    expect(result.id).toBeDefined()
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(result.updatedAt).toBeInstanceOf(Date)
    expect(spyInsert).toHaveBeenCalledTimes(1)
  })

  it('Should not be able to register with same name twice', async () => {
    const props = CompanyDataBuilder({ name: 'a@a.com' })
    await sut.execute(props)

    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(ConflictError)
  })

  it('Should throws error when name not provided', async () => {
    const props = Object.assign(CompanyDataBuilder({}), { name: null })
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    )
  })

  it('Should throws error when category not provided', async () => {
    const props = Object.assign(CompanyDataBuilder({}), { category: null })
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    )
  })
})
