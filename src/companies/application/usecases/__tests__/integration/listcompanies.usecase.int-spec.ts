import { CompanyEntity } from '@/companies/domain/entities/company.entity'
import { CompanyDataBuilder } from '@/companies/domain/testing/helpers/company-data-builder'
import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { ListCompaniesUseCase } from '../../listcompanies.usecase'
import { CompanyPrismaRepository } from '@/companies/infrastructure/database/prisma/repositories/company-prisma.repository'

describe('ListCompaniesUseCase integration tests', () => {
  const prismaService = new PrismaClient()
  let sut: ListCompaniesUseCase.UseCase
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
    sut = new ListCompaniesUseCase.UseCase(repository)
    await prismaService.company.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should return the companies ordered by createdAt', async () => {
    const createdAt = new Date()
    const entities: CompanyEntity[] = []
    const arrange = Array(3).fill(CompanyDataBuilder({}))
    arrange.forEach((element, index) => {
      entities.push(
        new CompanyEntity({
          ...element,
          createdAt: new Date(createdAt.getTime() + index),
        }),
      )
    })
    await prismaService.company.createMany({
      data: entities.map(item => item.toJSON()),
    })

    const output = await sut.execute({})

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
    const entities: CompanyEntity[] = []
    const arrange = ['test', 'a', 'TEST', 'b', 'TeSt']
    arrange.forEach((element, index) => {
      entities.push(
        new CompanyEntity({
          ...CompanyDataBuilder({ name: element }),
          createdAt: new Date(createdAt.getTime() + index),
        }),
      )
    })

    await prismaService.company.createMany({
      data: entities.map(item => item.toJSON()),
    })

    let output = await sut.execute({
      page: 1,
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
