import { CompanyEntity } from '@/companies/domain/entities/company.entity'
import { CompanyRepository } from '@/companies/domain/repositories/company.repository'
import { CompanyDataBuilder } from '@/companies/domain/testing/helpers/company-data-builder'
import { CompaniesModule } from '@/companies/infrastructure/companies.module'
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
import request from 'supertest'

describe('CompaniesController e2e tests - DELETE /companies/:id', () => {
  let app: INestApplication
  let module: TestingModule
  const prismaService = new PrismaClient()
  let userRepository: UserRepository.Repository
  let companyRepository: CompanyRepository.Repository
  let hashProvider: HashProvider
  let hashPassword: string
  let accessToken: string
  let user: UserEntity
  let company: CompanyEntity

  beforeAll(async () => {
    setupPrismaTests()

    module = await Test.createTestingModule({
      imports: [
        EnvConfigModule,
        UsersModule,
        CompaniesModule,
        DatabaseModule.forTest(prismaService),
      ],
    }).compile()

    app = module.createNestApplication()
    applyGlobalConfig(app)
    await app.init()

    userRepository = module.get<UserRepository.Repository>('UserRepository')
    companyRepository =
      module.get<CompanyRepository.Repository>('CompanyRepository')
    hashProvider = new BcryptjsHashProvider()
    hashPassword = await hashProvider.generateHash('1234')
  })

  beforeEach(async () => {
    await prismaService.user.deleteMany()
    await prismaService.company.deleteMany()

    company = new CompanyEntity(CompanyDataBuilder({}))
    await companyRepository.insert(company)

    user = new UserEntity(
      UserDataBuilder({
        email: 'a@a.com',
        password: hashPassword,
        companyId: company._id,
      }),
    )

    await userRepository.insert(user)

    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'a@a.com', password: '1234' })
      .expect(200)

    accessToken = loginResponse.body.accessToken
  })

  it('should remove a company', async () => {
    await request(app.getHttpServer())
      .delete(`/companies/${company._id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204)
      .expect({})
  })

  it('should return an error with 404 when company ID is invalid', async () => {
    await request(app.getHttpServer())
      .delete('/companies/fakeId')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404)
      .expect({
        statusCode: 404,
        error: 'Not Found',
        message: 'CompanyModel not found using ID fakeId',
      })
  })

  it('should return an error with 401 when request is unauthorized', async () => {
    await request(app.getHttpServer())
      .delete(`/companies/${company._id}`)
      .expect(401)
      .expect({
        statusCode: 401,
        message: 'Unauthorized',
      })
  })
})
