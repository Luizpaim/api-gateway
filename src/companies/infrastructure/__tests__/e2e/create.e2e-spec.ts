import { CompanyEntity } from '@/companies/domain/entities/company.entity'
import { CompanyRepository } from '@/companies/domain/repositories/company.repository'
import { CompanyDataBuilder } from '@/companies/domain/testing/helpers/company-data-builder'
import { applyGlobalConfig } from '@/global-config'
import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { instanceToPlain } from 'class-transformer'
import request from 'supertest'
import { CompaniesController } from '../../companies.controller'
import { CompaniesModule } from '../../companies.module'
import { SignupDto } from '../../dtos/signup.dto'

describe('CompaniesController e2e tests', () => {
  jest.setTimeout(60000)

  let app: INestApplication
  let module: TestingModule
  let repository: CompanyRepository.Repository
  let signupDto: SignupDto

  const prismaService = new PrismaClient()

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [
        EnvConfigModule,
        CompaniesModule,
        DatabaseModule.forTest(prismaService),
      ],
    }).compile()

    app = module.createNestApplication()
    applyGlobalConfig(app)

    await app.init()

    repository = module.get<CompanyRepository.Repository>('CompanyRepository')
  })

  beforeEach(async () => {
    signupDto = {
      name: 'test name',
      category: 'a@a.com',
    }
    await prismaService.company.deleteMany()
  })

  afterAll(async () => {
    await app.close()
    await new Promise(res => setTimeout(res, 500))
  })

  describe('POST /companies', () => {
    it('should create a company', async () => {
      const res = await request(app.getHttpServer())
        .post('/companies')
        .send(signupDto)
        .expect(201)
      expect(Object.keys(res.body)).toStrictEqual(['data'])
      const company = await repository.findById(res.body.data.id)
      const presenter = CompaniesController.companyToResponse(company.toJSON())
      const serialized = instanceToPlain(presenter)
      expect(res.body.data).toStrictEqual(serialized)
    })

    it('should return a error with 422 code when the request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/companies')
        .send({})
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'name should not be empty',
        'name must be a string',
        'category should not be empty',
        'category must be a string',
      ])
    })

    it('should return a error with 422 code when the name field is invalid', async () => {
      delete signupDto.name
      const res = await request(app.getHttpServer())
        .post('/companies')
        .send(signupDto)
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'name should not be empty',
        'name must be a string',
      ])
    })

    it('should return a error with 422 code when the category field is invalid', async () => {
      delete signupDto.category
      const res = await request(app.getHttpServer())
        .post('/companies')
        .send(signupDto)
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'category should not be empty',
        'category must be a string',
      ])
    })

    it('should return a error with 422 code with invalid field provided', async () => {
      const res = await request(app.getHttpServer())
        .post('/companies')
        .send(Object.assign(signupDto, { xpto: 'fake' }))
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual(['property xpto should not exist'])
    })

    it('should return a error with 409 code when the name is duplicated', async () => {
      const entity = new CompanyEntity(CompanyDataBuilder({ ...signupDto }))
      await repository.insert(entity)
      const res = await request(app.getHttpServer())
        .post('/companies')
        .send(signupDto)
        .expect(409)
        .expect({
          statusCode: 409,
          error: 'Conflict',
          message: 'Name address already used',
        })
    })
  })
})
