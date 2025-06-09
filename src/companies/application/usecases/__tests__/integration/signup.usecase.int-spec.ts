import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { SignupUseCase } from '../../signup.usecase'
import { CompanyPrismaRepository } from '@/companies/infrastructure/database/prisma/repositories/company-prisma.repository'

describe('SignupUseCase integration tests', () => {
  const prismaService = new PrismaClient()
  let sut: SignupUseCase.UseCase
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
    sut = new SignupUseCase.UseCase(repository)
    await prismaService.company.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should create a company', async () => {
    const props = {
      name: 'test name',
      category: 'a@a.com',
    }
    const output = await sut.execute(props)
    expect(output.id).toBeDefined()
    expect(output.createdAt).toBeInstanceOf(Date)
  })
})
