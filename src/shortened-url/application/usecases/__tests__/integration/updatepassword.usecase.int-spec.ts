import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository'
import { Test, TestingModule } from '@nestjs/testing'
import { Company, PrismaClient } from '@prisma/client'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { InvalidPasswordError } from '@/shared/application/errors/invalid-password-error'
import { UpdatePasswordUseCase } from '@/users/application/usecases/update-password.usecase'

describe('UpdatePasswordUseCase integration tests', () => {
  const prismaService = new PrismaClient()
  let sut: UpdatePasswordUseCase.UseCase
  let repository: UserPrismaRepository
  let module: TestingModule
  let hashProvider: HashProvider
  let company: Company

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
    repository = new UserPrismaRepository(prismaService as any)
    hashProvider = new BcryptjsHashProvider()
  })

  beforeEach(async () => {
    company = await prismaService.company.create({
      data: {
        name: 'Acme Corp',
        category: 'Tech',
      },
    })
    sut = new UpdatePasswordUseCase.UseCase(repository, hashProvider)
    await prismaService.user.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should throws error when a entity found by id', async () => {
    const entity = new UserEntity(
      UserDataBuilder({
        companyId: company.id,
        deletedAt: null,
      }),
    )
    await expect(() =>
      sut.execute({
        id: entity._id,
        companyId: entity.companyId,
        oldPassword: 'OldPassword',
        password: 'NewPassword',
      }),
    ).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID ${entity._id}`),
    )
  })

  it('should throws error when old password not provided', async () => {
    const entity = new UserEntity(
      UserDataBuilder({
        companyId: company.id,
        deletedAt: null,
      }),
    )
    const newUser = await prismaService.user.create({
      data: entity.toJSON(),
    })

    await expect(() =>
      sut.execute({
        id: entity._id,
        companyId: entity.companyId,
        oldPassword: '',
        password: 'NewPassword',
      }),
    ).rejects.toThrow(
      new InvalidPasswordError('Old password and new password is required'),
    )
  })

  it('should throws error when new password not provided', async () => {
    const entity = new UserEntity(
      UserDataBuilder({
        companyId: company.id,
        deletedAt: null,
      }),
    )
    const newUser = await prismaService.user.create({
      data: entity.toJSON(),
    })

    await expect(() =>
      sut.execute({
        id: entity._id,
        companyId: entity.companyId,
        oldPassword: 'OldPassword',
        password: '',
      }),
    ).rejects.toThrow(
      new InvalidPasswordError('Old password and new password is required'),
    )
  })

  it('should update a password', async () => {
    const oldPassword = await hashProvider.generateHash('1234')
    const entity = new UserEntity(
      UserDataBuilder({
        password: oldPassword,
        companyId: company.id,
        deletedAt: null,
      }),
    )
    const newUser = await prismaService.user.create({
      data: entity.toJSON(),
    })

    const output = await sut.execute({
      id: entity._id,
      companyId: entity.companyId,
      oldPassword: '1234',
      password: 'NewPassword',
    })

    const result = await hashProvider.compareHash(
      'NewPassword',
      output.password,
    )

    expect(result).toBeTruthy()
  })
})
