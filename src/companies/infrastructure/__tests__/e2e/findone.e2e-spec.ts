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
import { SignupDto } from '../../dtos/signup.dto'

describe('CompaniesController e2e tests', () => {
  let app: INestApplication
  let module: TestingModule
  let repositoryUser: UserRepository.Repository
  let repositoryCompany: CompanyRepository.Repository
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
    const signupDto: SignupDto = {
      name: 'test name',
      category: 'a@a.com',
    }

    await prismaService.company.deleteMany()
    await prismaService.user.deleteMany()

    const res = await request(app.getHttpServer())
      .post('/companies')
      .send(signupDto)
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

  describe('GET /companies/:id', () => {
    it('should get a company', async () => {
      const res = await request(app.getHttpServer())
        .get(`/companies/${companyId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      const company = await repositoryCompany.findById(companyId)

      const presenter = CompaniesController.companyToResponse(company.toJSON())
      const serialized = instanceToPlain(presenter)

      expect(res.body.data).toStrictEqual(serialized)
    })

    it('should return an error with 404 code when using an invalid id', async () => {
      await request(app.getHttpServer())
        .get('/companies/fakeId')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)
        .expect({
          statusCode: 404,
          error: 'Not Found',
          message: 'CompanyModel not found using ID fakeId',
        })
    })

    it('should return an error with 401 code when the request is not authorized', async () => {
      await request(app.getHttpServer())
        .get('/companies/fakeId')
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        })
    })
  })
})
