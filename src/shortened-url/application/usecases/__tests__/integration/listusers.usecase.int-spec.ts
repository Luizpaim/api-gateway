import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository'
import { Test, TestingModule } from '@nestjs/testing'
import { Company, PrismaClient } from '@prisma/client'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { ListUsersUseCase } from '@/users/application/usecases/listusers.usecase'

describe('ListUsersUseCase integration tests', () => {
  const prismaService = new PrismaClient()
  let sut: ListUsersUseCase.UseCase
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
    company = await prismaService.company.create({
      data: {
        name: 'Acme Corp',
        category: 'Tech',
      },
    })

    sut = new ListUsersUseCase.UseCase(repository)
    await prismaService.user.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should return the users ordered by createdAt', async () => {
    const createdAt = new Date()
    const entities: UserEntity[] = []
    const arrange = Array(3).fill(
      UserDataBuilder({
        companyId: company.id,
        deletedAt: null,
      }),
    )
    arrange.forEach((element, index) => {
      entities.push(
        new UserEntity({
          ...element,
          companyId: company.id,
          email: `test${index}@mail.com`,
          createdAt: new Date(createdAt.getTime() + index),
          deletedAt: null,
        }),
      )
    })
    await prismaService.user.createMany({
      data: entities.map(item => item.toJSON()),
    })

    const output = await sut.execute({
      companyId: company.id,
    })

    expect(output).toStrictEqual({
      items: entities.reverse().map(item => item.toJSON()),
      total: 3,
      currentPage: 1,
      perPage: 15,
      lastPage: 1,
    })
  })

  it('should returns output using filter, sort and paginate', async () => {
    const createdAt = new Date()
    const entities: UserEntity[] = []
    const arrange = ['test', 'a', 'TEST', 'b', 'TeSt']
    arrange.forEach((element, index) => {
      entities.push(
        new UserEntity({
          ...UserDataBuilder({
            name: element,
            companyId: company.id,
            deletedAt: null,
          }),
          createdAt: new Date(createdAt.getTime() + index),
        }),
      )
    })

    await prismaService.user.createMany({
      data: entities.map(item => item.toJSON()),
    })

    let output = await sut.execute({
      page: 1,
      companyId: company.id,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: 'TEST',
    })

    expect(output).toMatchObject({
      items: [entities[0].toJSON(), entities[4].toJSON()],
      total: 3,
      currentPage: 1,
      perPage: 2,
      lastPage: 2,
    })

    output = await sut.execute({
      page: 2,
      companyId: company.id,
      perPage: 2,
      sort: 'name',
      sortDir: 'asc',
      filter: 'TEST',
    })

    expect(output).toMatchObject({
      items: [entities[2].toJSON()],
      total: 3,
      currentPage: 2,
      perPage: 2,
      lastPage: 2,
    })
  })
})
