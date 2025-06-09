import { PrismaClient } from '@prisma/client'
import { Test, TestingModule } from '@nestjs/testing'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { CompanyPrismaRepository } from '../../company-prisma.repository'
import { CompanyEntity } from '@/companies/domain/entities/company.entity'
import { CompanyDataBuilder } from '@/companies/domain/testing/helpers/company-data-builder'
import { CompanyRepository } from '@/companies/domain/repositories/company.repository'

describe('CompanyPrismaRepository integration tests', () => {
  const prismaService = new PrismaClient()
  let sut: CompanyPrismaRepository
  let module: TestingModule

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
  })

  beforeEach(async () => {
    sut = new CompanyPrismaRepository(prismaService as any)
    await prismaService.company.deleteMany()
  })

  it('should throws error when entity not found', async () => {
    await expect(() => sut.findById('FakeId')).rejects.toThrow(
      new NotFoundError('CompanyModel not found using ID FakeId'),
    )
  })

  it('should finds a entity by id', async () => {
    const entity = new CompanyEntity(CompanyDataBuilder({}))
    const newCompany = await prismaService.company.create({
      data: entity.toJSON(),
    })

    const output = await sut.findById(newCompany.id)
    expect(output.toJSON()).toStrictEqual(entity.toJSON())
  })

  it('should insert a new entity', async () => {
    const entity = new CompanyEntity(CompanyDataBuilder({}))
    await sut.insert(entity)

    const result = await prismaService.company.findFirst({
      where: {
        id: entity._id,
      },
    })

    expect(result).toStrictEqual(entity.toJSON())
  })

  it('should returns all companies', async () => {
    const entity = new CompanyEntity(CompanyDataBuilder({}))
    const newCompany = await prismaService.company.create({
      data: entity.toJSON(),
    })

    const entities = await sut.findAll()
    expect(entities).toHaveLength(1)
    expect(JSON.stringify(entities)).toBe(JSON.stringify([entity]))
    entities.map(item => expect(item.toJSON()).toStrictEqual(entity.toJSON()))
  })

  it('should throws error on update when a entity not found', async () => {
    const entity = new CompanyEntity(CompanyDataBuilder({}))
    await expect(() => sut.update(entity)).rejects.toThrow(
      new NotFoundError(`CompanyModel not found using ID ${entity._id}`),
    )
  })

  it('should update a entity', async () => {
    const entity = new CompanyEntity(CompanyDataBuilder({}))
    const newCompany = await prismaService.company.create({
      data: entity.toJSON(),
    })
    entity.updateName('new name')
    await sut.update(entity)

    const output = await prismaService.company.findFirst({
      where: {
        id: entity._id,
      },
    })
    expect(output.name).toBe('new name')
  })

  it('should throws error on delete when a entity not found', async () => {
    const entity = new CompanyEntity(CompanyDataBuilder({}))
    await expect(() => sut.delete(entity._id)).rejects.toThrow(
      new NotFoundError(`CompanyModel not found using ID ${entity._id}`),
    )
  })

  it('should delete a entity', async () => {
    const entity = new CompanyEntity(CompanyDataBuilder({}))
    const newCompany = await prismaService.company.create({
      data: entity.toJSON(),
    })
    await sut.delete(entity._id)

    const output = await prismaService.company.findFirst({
      where: {
        id: entity._id,
      },
    })
    expect(output).toBeNull()
  })

  it('should throws error when a entity found by name', async () => {
    const entity = new CompanyEntity(CompanyDataBuilder({ name: 'a@a.com' }))
    const newCompany = await prismaService.company.create({
      data: entity.toJSON(),
    })

    await expect(() => sut.nameExists('a@a.com')).rejects.toThrow(
      new ConflictError(`Name address already used`),
    )
  })

  it('should not finds a entity by name', async () => {
    expect.assertions(0)
    await sut.nameExists('a@a.com')
  })

  describe('search method tests', () => {
    it('should apply only pagination when the other params are null', async () => {
      const createdAt = new Date()
      const entities: CompanyEntity[] = []
      const arrange = Array(16).fill(CompanyDataBuilder({}))
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

      const searchOutput = await sut.search(
        new CompanyRepository.SearchParams(),
      )
      const items = searchOutput.items

      expect(searchOutput).toBeInstanceOf(CompanyRepository.SearchResult)
      expect(searchOutput.total).toBe(16)
      expect(searchOutput.items.length).toBe(15)
      searchOutput.items.forEach(item => {
        expect(item).toBeInstanceOf(CompanyEntity)
      })
    })

    it('should search using filter, sort and paginate', async () => {
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

      const searchOutputPage1 = await sut.search(
        new CompanyRepository.SearchParams({
          page: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: 'TEST',
        }),
      )

      expect(searchOutputPage1.items[0].toJSON()).toMatchObject(
        entities[0].toJSON(),
      )
      expect(searchOutputPage1.items[1].toJSON()).toMatchObject(
        entities[4].toJSON(),
      )

      const searchOutputPage2 = await sut.search(
        new CompanyRepository.SearchParams({
          page: 2,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: 'TEST',
        }),
      )

      expect(searchOutputPage2.items[0].toJSON()).toMatchObject(
        entities[2].toJSON(),
      )
    })
  })
})
