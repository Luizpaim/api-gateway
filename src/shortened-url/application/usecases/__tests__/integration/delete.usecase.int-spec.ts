import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository'
import { Test, TestingModule } from '@nestjs/testing'
import { Company, PrismaClient } from '@prisma/client'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { DeleteUserUseCase } from '@/users/application/usecases/delete-user.usecase'

describe('DeleteUseCase integration tests', () => {
  const prismaService = new PrismaClient()
  let sut: DeleteUserUseCase.UseCase
  let repository: UserPrismaRepository
  let module: TestingModule
  let company: Company

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
    repository = new UserPrismaRepository(prismaService as any)
  })

  beforeEach(async () => {
    sut = new DeleteUserUseCase.UseCase(repository)

    company = await prismaService.company.create({
      data: {
        name: 'Acme Corp',
        category: 'Tech',
      },
    })
    await prismaService.user.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should throws error when entity not found', async () => {
    await expect(() =>
      sut.execute({
        id: 'fakeId',
        companyId: 'df96ae94-6128-486e-840c-b6f78abb4802',
      }),
    ).rejects.toThrow(new NotFoundError('UserModel not found using ID fakeId'))
  })

  it('should delete a user', async () => {
    const entity = new UserEntity(
      UserDataBuilder({
        companyId: company.id,
        deletedAt: null,
      }),
    )
    const newUser = await prismaService.user.create({
      data: entity.toJSON(),
    })
    await sut.execute({ id: entity._id, companyId: entity.companyId })

    const output = await prismaService.user.findUnique({
      where: {
        id: entity._id,
      },
    })
    expect(output.deletedAt).toBeInstanceOf(Date)
    const models = await prismaService.user.findMany({
      where: {
        deletedAt: null,
      },
    })
    expect(models).toHaveLength(0)
  })
})
