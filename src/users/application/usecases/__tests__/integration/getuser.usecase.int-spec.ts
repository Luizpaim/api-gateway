import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository'
import { Test, TestingModule } from '@nestjs/testing'
import { Company, PrismaClient } from '@prisma/client'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { GetUserUseCase } from '../../getuser.usecase'
import { RedisCacheProvider } from '@/shared/application/providers/redis-cache.provider'

describe('GetUserUseCase integration tests', () => {
  const prismaService = new PrismaClient()
  let sut: GetUserUseCase.UseCase
  let repository: UserPrismaRepository
  let module: TestingModule
  let redisCacheProvider: RedisCacheProvider
  let company: Company

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
    repository = new UserPrismaRepository(prismaService as any)
  })

  beforeEach(async () => {
    redisCacheProvider = {
      getCache: jest.fn(),
      setCache: jest.fn(),
      delCache: jest.fn(),
    }

    company = await prismaService.company.create({
      data: {
        name: 'Acme Corp',
        category: 'Tech',
      },
    })

    sut = new GetUserUseCase.UseCase(repository, redisCacheProvider)
    await prismaService.user.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should throws error when entity not found', async () => {
    await expect(() =>
      sut.execute({
        id: 'fakeId',
        companyId: 'e6bfa6da-8bd6-4d28-8cb3-80ed3790a294',
      }),
    ).rejects.toThrow(new NotFoundError('UserModel not found using ID fakeId'))
  })

  it('should returns a user', async () => {
    const entity = new UserEntity(
      UserDataBuilder({
        companyId: company.id,
        deletedAt: null,
      }),
    )
    const model = await prismaService.user.create({
      data: entity.toJSON(),
    })

    const output = await sut.execute({
      id: entity._id,
      companyId: entity.companyId,
    })

    expect(output).toMatchObject(model)
  })
})
