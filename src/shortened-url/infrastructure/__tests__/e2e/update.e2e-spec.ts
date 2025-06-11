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
import { instanceToPlain } from 'class-transformer'
import request from 'supertest'
import { CompaniesModule } from '@/companies/infrastructure/companies.module'
import { BcryptjsHashProvider } from '@/users/infrastructure/providers/hash-provider/bcryptjs-hash.provider'
import { UsersModule } from '@/users/infrastructure/users.module'
import { ShortenedUrlEntity } from '@/shortened-url/domain/entities/shortened-url.entity'
import { ShortenedUrlRepository } from '@/shortened-url/domain/repositories/shortened-url.repository'
import { UpdateShortenedUrlDto } from '../../dtos/update-shortened-url.dto'
import { ShortenedUrlModule } from '../../shortened-url.module'
import { ShortenedUrlDataBuilder } from '@/shortened-url/domain/testing/helpers/shortened-url-data-builder'
import { ShortenedUrlController } from '../../shortened-url.controller'

describe('UsersController e2e tests', () => {
  let app: INestApplication
  let module: TestingModule
  let repository: UserRepository.Repository
  let repositoryShortnedUrl: ShortenedUrlRepository.Repository
  let updateShortenedUrlDto: UpdateShortenedUrlDto
  let entity: UserEntity
  let entityShortenedUrl: ShortenedUrlEntity
  let companyId: string
  let resShortenedUrl: Record<string, any>

  const prismaService = new PrismaClient()

  let hashProvider: HashProvider
  let hashPassword: string
  let accessToken: string

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [
        EnvConfigModule,
        ShortenedUrlModule,
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

    updateShortenedUrlDto = {
      longUrl: 'https://quasar.dev/vue-components/table#responsive-tables',
    }

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

  describe('PUT /shortened-url/:id', () => {
    it('should return a error with 422 code when the request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .put(`/shortened-url/${entity._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'longUrl should not be empty',
        'longUrl must be a URL address',
      ])
    })

    it('should return a error with 404 code when throw NotFoundError with invalid id', async () => {
      const res = await request(app.getHttpServer())
        .put('/shortened-url/fakeId')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateShortenedUrlDto)
        .expect(404)
        .expect({
          statusCode: 404,
          error: 'Not Found',
          message: 'ShortenedUrlModel not found using ID fakeId',
        })
    })

    it('should return a error with 401 code when the request is not authorized', async () => {
      const res = await request(app.getHttpServer())
        .put('/shortened-url/fakeId')
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        })
    })

    it('should update a shortened-url', async () => {
      resShortenedUrl = await request(app.getHttpServer())
        .post('/shortened-url')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          longUrl: 'https://longurl.com/teste',
        })
        .expect(201)

      updateShortenedUrlDto.longUrl =
        'https://quasar.dev/vue-components/table#responsive-tables'
      const res = await request(app.getHttpServer())
        .put(`/shortened-url/${resShortenedUrl.body.data.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateShortenedUrlDto)
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
