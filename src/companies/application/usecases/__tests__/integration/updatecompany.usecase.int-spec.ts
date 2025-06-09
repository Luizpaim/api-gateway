import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { CompanyEntity } from '@/companies/domain/entities/company.entity'
import { CompanyDataBuilder } from '@/companies/domain/testing/helpers/company-data-builder'
import { CompanyPrismaRepository } from '@/companies/infrastructure/database/prisma/repositories/company-prisma.repository'
import { UpdateCompanyUseCase } from '../../update-company.usecase'

describe('UpdateCompanyUseCase integration tests', () => {
  const prismaService = new PrismaClient()
  let sut: UpdateCompanyUseCase.UseCase
  let repository: CompanyPrismaRepository
  let module: TestingModule

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
    repository = new CompanyPrismaRepository(prismaService as any)
  })

  beforeEach(async () => {
    sut = new UpdateCompanyUseCase.UseCase(repository)
    await prismaService.company.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should throws error when entity not found', async () => {
    await expect(() =>
      sut.execute({ id: 'fakeId', name: 'fake name' }),
    ).rejects.toThrow(
      new NotFoundError('CompanyModel not found using ID fakeId'),
    )
  })

  it('should update a company', async () => {
    const entity = new CompanyEntity(CompanyDataBuilder({}))
    const model = await prismaService.company.create({
      data: entity.toJSON(),
    })

    const output = await sut.execute({ id: entity._id, name: 'new name' })

    expect(output.name).toBe('new name')
  })
})
