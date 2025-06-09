import { PrismaClient, Company } from '@prisma/client'
import { ValidationError } from '@/shared/domain/errors/validation-error'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { CompanyEntity } from '@/companies/domain/entities/company.entity'
import { CompanyModelMapper } from '../../company-model.mapper'

describe('CompanyModelMapper integration tests', () => {
  let prismaService: PrismaClient
  let props: any

  beforeAll(async () => {
    setupPrismaTests()
    prismaService = new PrismaClient()
    await prismaService.$connect()
  })

  beforeEach(async () => {
    await prismaService.company.deleteMany()
    props = {
      id: 'd4255494-f981-4d26-a2a1-35d3f5b8d36a',
      name: 'Test name',
      category: 'TestPassword123',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    }
  })

  afterAll(async () => {
    await prismaService.$disconnect()
  })

  it('should throws error when company model is invalid', async () => {
    const model: Company = Object.assign(props, { name: null })
    expect(() => CompanyModelMapper.toEntity(model)).toThrow(ValidationError)
  })

  it('should convert a company model to a company entity', async () => {
    const model: Company = await prismaService.company.create({
      data: props,
    })
    const sut = CompanyModelMapper.toEntity(model)
    expect(sut).toBeInstanceOf(CompanyEntity)
    expect(sut.toJSON()).toStrictEqual(props)
  })
})
