import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { CompanyEntity } from '@/companies/domain/entities/company.entity'
import { CompanyDataBuilder } from '@/companies/domain/testing/helpers/company-data-builder'
import { CompanyPrismaRepository } from '@/companies/infrastructure/database/prisma/repositories/company-prisma.repository'
import { DeleteCompanyUseCase } from '../../delete-company.usecase'

describe('DeleteUseCase integration tests', () => {
  const prismaService = new PrismaClient()
  let sut: DeleteCompanyUseCase.UseCase
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
    sut = new DeleteCompanyUseCase.UseCase(repository)
    await prismaService.company.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should throws error when entity not found', async () => {
    await expect(() => sut.execute({ id: 'fakeId' })).rejects.toThrow(
      new NotFoundError('CompanyModel not found using ID fakeId'),
    )
  })

  it('should delete a company', async () => {
    const entity = new CompanyEntity(CompanyDataBuilder({}))
    const newCompany = await prismaService.company.create({
      data: entity.toJSON(),
    })
    await sut.execute({ id: entity._id })

    const output = await prismaService.company.findUnique({
      where: {
        id: entity._id,
      },
    })
    expect(output).toBeNull()
    const models = await prismaService.company.findMany()
    expect(models).toHaveLength(0)
  })
})
