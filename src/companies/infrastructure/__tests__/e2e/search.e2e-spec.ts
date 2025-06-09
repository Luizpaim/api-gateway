import { CompanyEntity } from '@/companies/domain/entities/company.entity'
import { CompanyRepository } from '@/companies/domain/repositories/company.repository'
import { CompanyDataBuilder } from '@/companies/domain/testing/helpers/company-data-builder'
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

describe('CompaniesController e2e tests - GET /companies', () => {
  let app: INestApplication
  let module: TestingModule
  const prismaService = new PrismaClient()
  let repositoryUser: UserRepository.Repository
  let repositoryCompany: CompanyRepository.Repository
  let accessToken: string
  let hashProvider: HashProvider
  let hashPassword: string
  let entityUser: UserEntity
  let entityCompanies: CompanyEntity[] = []

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
    await prismaService.company.deleteMany()
    await prismaService.user.deleteMany()

    const now = new Date()
    entityCompanies = []

    for (let i = 0; i < 3; i++) {
      entityCompanies.push(
        new CompanyEntity(
          CompanyDataBuilder({
            name: `Company ${i + 1}`,
            category: 'Tech',
            createdAt: new Date(now.getTime() + i * 1000),
          }),
        ),
      )
    }

    for (const company of entityCompanies) {
      await repositoryCompany.insert(company)
    }

    entityUser = new UserEntity(
      UserDataBuilder({
        name: 'User Test',
        email: 'a@a.com',
        password: hashPassword,
        companyId: entityCompanies[0]._id,
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

  it('should list all companies ordered by createdAt desc', async () => {
    const res = await request(app.getHttpServer())
      .get('/companies')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)

    expect(Object.keys(res.body)).toStrictEqual(['data', 'meta'])

    expect(res.body.data).toStrictEqual(
      [...entityCompanies]
        .reverse()
        .map(item =>
          instanceToPlain(CompaniesController.companyToResponse(item)),
        ),
    )

    expect(res.body.meta).toStrictEqual({
      total: 3,
      currentPage: 1,
      perPage: 15,
      lastPage: 1,
    })
  })

  it('should return 401 when not authorized', async () => {
    await request(app.getHttpServer())
      .get('/companies')
      .expect(401)
      .expect({
        statusCode: 401,
        message: 'Unauthorized',
      })
  })

  it('should return 422 for invalid query params', async () => {
    const res = await request(app.getHttpServer())
      .get('/companies?fakeParam=10')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(422)

    expect(res.body.error).toBe('Unprocessable Entity')
    expect(res.body.message).toEqual(['property fakeParam should not exist'])
  })
})
