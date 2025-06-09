import { CompanyRepository } from '@/companies/domain/repositories/company.repository'
import { applyGlobalConfig } from '@/global-config'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserRepository } from '@/users/domain/repositories/user.repository'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider'
import { UsersModule } from '@/users/infrastructure/users.module'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { instanceToPlain } from 'class-transformer'
import request from 'supertest'
import { CompaniesController } from '../../companies.controller'
import { CompaniesModule } from '../../companies.module'
import { UpdateCompanyDto } from '../../dtos/update-company.dto'

describe('UsersController e2e tests', () => {
  let app: INestApplication
  let module: TestingModule

  let repositoryUser: UserRepository.Repository
  let repositoryCompany: CompanyRepository.Repository

  let updateCompanyDto: UpdateCompanyDto

  const prismaService = new PrismaClient()

  let hashProvider: HashProvider
  let hashPassword: string

  let accessToken: string
  let companyId: string

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [
        EnvConfigModule,
        CompaniesModule,
        UsersModule,
        DatabaseModule.forTest(prismaService),
      ],
    }).compile()

    app = module.createNestApplication()
    applyGlobalConfig(app)
    await app.init()

    repositoryUser = module.get<UserRepository.Repository>('UserRepository')
    repositoryCompany =
      module.get<CompanyRepository.Repository>('CompanyRepository')

    hashProvider = new BcryptjsHashProvider()
    hashPassword = await hashProvider.generateHash('1234')
  })

  beforeEach(async () => {
    updateCompanyDto = {
      name: 'test name',
      category: 'test category',
    }

    await prismaService.company.deleteMany()
    await prismaService.user.deleteMany()

    const res = await request(app.getHttpServer())
      .post('/companies')
      .send(updateCompanyDto)
      .expect(201)

    companyId = res.body.data.id

    const entityUser = new UserEntity(
      UserDataBuilder({
        name: 'Test User',
        email: 'a@a.com',
        password: hashPassword,
        companyId,
        deletedAt: null,
      }),
    )

    await repositoryUser.insert(entityUser)

    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'a@a.com', password: '1234' })
      .expect(200)

    accessToken = loginResponse.body.accessToken
  })

  describe('PUT /companies/:id', () => {
    it('should update a company', async () => {
      updateCompanyDto.name = 'test name updated'
      updateCompanyDto.category = 'name Category'

      const res = await request(app.getHttpServer())
        .put(`/companies/${companyId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateCompanyDto)
        .expect(200)

      const company = await repositoryCompany.findById(companyId)

      const presenter = CompaniesController.companyToResponse(company.toJSON())
      const serialized = instanceToPlain(presenter)

      expect(res.body.data).toStrictEqual(serialized)
    })

    it('should return a error with 422 code when the request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .put(`/companies/${companyId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'name should not be empty',
        'name must be a string',
        'category must be a string',
      ])
    })

    it('should return a error with 404 code when throw NotFoundError with invalid id', async () => {
      const res = await request(app.getHttpServer())
        .put('/companies/fakeId')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateCompanyDto)
        .expect(404)
        .expect({
          statusCode: 404,
          error: 'Not Found',
          message: 'CompanyModel not found using ID fakeId',
        })
    })

    it('should return a error with 401 code when the request is not authorized', async () => {
      const res = await request(app.getHttpServer())
        .put('/companies/fakeId')
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        })
    })
  })
})
