import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository'
import { Test, TestingModule } from '@nestjs/testing'
import { Company, PrismaClient } from '@prisma/client'
import { SignupUseCase } from '../../signup.usecase'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider'
import { KafkaProvider } from '@/shared/application/providers/kafka-provider'

describe('SignupUseCase integration tests', () => {
  const prismaService = new PrismaClient()
  let sut: SignupUseCase.UseCase
  let repository: UserPrismaRepository
  let module: TestingModule
  let hashProvider: HashProvider
  let kafkaProvider: KafkaProvider
  let company: Company

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
    repository = new UserPrismaRepository(prismaService as any)
    hashProvider = new BcryptjsHashProvider()
    kafkaProvider = {
      publishEvent: jest.fn(),
      onModuleInit: jest.fn(),
    }
  })

  beforeEach(async () => {
    company = await prismaService.company.create({
      data: {
        name: 'Acme Corp',
        category: 'Tech',
      },
    })
    sut = new SignupUseCase.UseCase(repository, hashProvider, kafkaProvider)
    await prismaService.user.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should create a user', async () => {
    const props = {
      name: 'test name',
      email: 'a@a.com',
      password: 'TestPassword123',
      companyId: company.id,
      deletedAt: null,
    }
    const output = await sut.execute(props)
    expect(output.id).toBeDefined()
    expect(output.createdAt).toBeInstanceOf(Date)
  })
})
