import { applyGlobalConfig } from '@/global-config'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserRepository } from '@/users/domain/repositories/user.repository'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import request from 'supertest'
import { CompaniesModule } from '@/companies/infrastructure/companies.module'
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider'
import { UsersModule } from '@/users/infrastructure/users.module'
import { ShortenedUrlModule } from '../../shortened-url.module'
import { ShortenedUrlRepository } from '@/shortened-url/domain/repositories/shortened-url.repository'
import { ShortenedUrlController } from '../../shortened-url.controller'
import { instanceToPlain } from 'class-transformer'

describe('UsersController e2e tests', () => {
  let app: INestApplication
  let module: TestingModule
  let repository: UserRepository.Repository
  let companyId: string
  let resShortenedUrl: Record<string, any>
  let repositoryShortnedUrl: ShortenedUrlRepository.Repository
  const prismaService = new PrismaClient()

  let hashProvider: HashProvider
  let entity: UserEntity
  let accessToken: string

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [
        ShortenedUrlModule,
        EnvConfigModule,
        UsersModule,
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

    const hashPassword = await hashProvider.generateHash('old_password')

    entity = new UserEntity(
      UserDataBuilder({ email: 'a@a.com', password: hashPassword, companyId }),
    )

    await repository.insert(entity)

    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send({ email: 'a@a.com', password: 'old_password' })
      .expect(200)
    accessToken = loginResponse.body.accessToken
  })

  describe('POST /shortened-url', () => {
    it('should return a error with 404 code when throw NotFoundError with invalid id', async () => {
      const res = await request(app.getHttpServer())
        .patch('/shortened-url/fakeId')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(404)
      expect(res.body.error).toBe('Not Found')
      expect(res.body.message).toEqual(
        'ShortenedUrlModel not found using ID fakeId',
      )
    })

    it('should return a error with 401 code when the request is not authorized', async () => {
      const res = await request(app.getHttpServer())
        .patch('/shortened-url/fakeId')
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        })
    })

    it('should update a visits total', async () => {
      resShortenedUrl = await request(app.getHttpServer())
        .post('/shortened-url')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          longUrl: 'https://longurl.com/teste',
        })
        .expect(201)

      const res = await request(app.getHttpServer())
        .patch(`/shortened-url/${resShortenedUrl.body.data.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(200)

      const shortenedUrl = await repositoryShortnedUrl.findById(
        resShortenedUrl.body.data.id,
      )
      const presenter = ShortenedUrlController.shortenedUrlToResponse(
        shortenedUrl.toJSON(),
      )
      const serialized = instanceToPlain(presenter)
      expect(res.body.data).toStrictEqual(serialized)
    })
  })
})
