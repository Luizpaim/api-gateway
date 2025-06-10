import { UserRepository } from '@/users/domain/repositories/user.repository'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module'

import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import request from 'supertest'

import { instanceToPlain } from 'class-transformer'
import { applyGlobalConfig } from '@/global-config'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { HashProvider } from '@/shared/application/providers/hash-provider'

import { CompaniesModule } from '@/companies/infrastructure/companies.module'
import { UsersModule } from '@/users/infrastructure/users.module'
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider'

import { ShortenedUrlModule } from '../../shortened-url.module'
import { ShortenedUrlController } from '../../shortened-url.controller'
import { ShortenedUrlRepository } from '@/shortened-url/domain/repositories/shortened-url.repository'
import { ShortenedUrlEntity } from '@/shortened-url/domain/entities/shortened-url.entity'
import { ShortenedUrlDataBuilder } from '@/shortened-url/domain/testing/helpers/shortened-url-data-builder'

describe('UsersController e2e tests', () => {
  let app: INestApplication
  let module: TestingModule

  let repository: UserRepository.Repository
  let repositoryShortnedUrl: ShortenedUrlRepository.Repository
  let entity: UserEntity
  let entityShortenedUrl: ShortenedUrlEntity
  let companyId: string

  const prismaService = new PrismaClient()

  let hashProvider: HashProvider
  let hashPassword: string
  let accessToken: string

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [
        EnvConfigModule,
        UsersModule,
        ShortenedUrlModule,
        CompaniesModule,
        DatabaseModule.forTest(prismaService),
      ],
    }).compile()

    app = module.createNestApplication()
    applyGlobalConfig(app)
    await app.init()

    repository = module.get<UserRepository.Repository>('UserRepository')
    repositoryShortnedUrl = module.get<ShortenedUrlRepository.Repository>(
      'ShortenedUrlRepository',
    )

    hashProvider = new BcryptjsHashProvider()
    hashPassword = await hashProvider.generateHash('1234')
  })

  beforeEach(async () => {
    const signupCompanyDto = {
      name: 'test name',
      category: 'a@a.com',
    }

    await prismaService.company.deleteMany()
    await prismaService.user.deleteMany()
    await prismaService.shortenedUrl.deleteMany()

    const res = await request(app.getHttpServer())
      .post('/companies')
      .send(signupCompanyDto)
      .expect(201)

    companyId = res.body.data.id

    entity = new UserEntity(
      UserDataBuilder({
        email: 'a@a.com',
        password: hashPassword,
        companyId,
      }),
    )

    await repository.insert(entity)

    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'a@a.com', password: '1234' })
      .expect(200)
    accessToken = loginResponse.body.accessToken

    entityShortenedUrl = new ShortenedUrlEntity(
      ShortenedUrlDataBuilder({
        userId: entity._id,
        companyId,
      }),
    )

    await repositoryShortnedUrl.insert(entityShortenedUrl)
  })

  describe('GET /shortened-url/:id', () => {
    it('should get a shortened url', async () => {
      const res = await request(app.getHttpServer())
        .get(`/shortened-url/${entityShortenedUrl._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
      const presenter = ShortenedUrlController.shortenedUrlToResponse(
        entityShortenedUrl.toJSON(),
      )
      const serialized = instanceToPlain(presenter)
      expect(res.body.data).toStrictEqual(serialized)
    })

    it('should return a error with 404 code when throw NotFoundError with invalid id', async () => {
      const res = await request(app.getHttpServer())
        .get('/shortened-url/fakeId')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)
        .expect({
          statusCode: 404,
          error: 'Not Found',
          message: 'ShortenedUrlModel not found using ID fakeId',
        })
    })

    it('should return a error with 401 code when the request is not authorized', async () => {
      const res = await request(app.getHttpServer())
        .get('/shortened-url/fakeId')
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        })
    })
  })
})
