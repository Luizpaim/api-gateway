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
import { ShortenedUrlModule } from '../../shortened-url.module'
import { ShortenedUrlRepository } from '@/shortened-url/domain/repositories/shortened-url.repository'
import { ShortenedUrlEntity } from '@/shortened-url/domain/entities/shortened-url.entity'
import { ShortenedUrlDataBuilder } from '@/shortened-url/domain/testing/helpers/shortened-url-data-builder'
import { ShortenedUrlController } from '../../shortened-url.controller'

describe('ShortenedUrlController e2e tests', () => {
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

  function generateShortCode(length = 6) {
    const chars = '0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [
        EnvConfigModule,
        UsersModule,
        CompaniesModule,
        ShortenedUrlModule,
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

  describe('GET /shortened-url', () => {
    it('should return the shortened-url ordered by createdAt', async () => {
      const createdAt = new Date()
      const entities: ShortenedUrlEntity[] = []
      const arrange = Array(3).fill(ShortenedUrlDataBuilder({}))
      arrange.forEach((element, index) => {
        entities.push(
          new ShortenedUrlEntity({
            ...element,
            companyId,
            userId: entityShortenedUrl.userId,
            shortCode: generateShortCode(),
            createdAt: new Date(createdAt.getTime() + index),
          }),
        )
      })
      await prismaService.shortenedUrl.deleteMany()

      await prismaService.shortenedUrl.createMany({
        data: entities.map(item => item.toJSON()),
      })
      const searchParams = {}
      const queryParams = new URLSearchParams(searchParams as any).toString()

      const res = await request(app.getHttpServer())
        .get(`/shortened-url/?${queryParams}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
      expect(Object.keys(res.body)).toStrictEqual(['data', 'meta'])
      expect(res.body).toStrictEqual({
        data: [...entities]
          .reverse()
          .map(item =>
            instanceToPlain(
              ShortenedUrlController.shortenedUrlToResponse(item),
            ),
          ),
        meta: {
          total: 3,
          currentPage: 1,
          perPage: 15,
          lastPage: 1,
        },
      })
    })

    it('should return the shortened-url ordered by createdAt', async () => {
      const entities: ShortenedUrlEntity[] = []
      const arrange = ['test', 'a', 'TEST', 'b', 'TeSt']
      arrange.forEach((element, index) => {
        entities.push(
          new ShortenedUrlEntity({
            ...ShortenedUrlDataBuilder({}),
            shortUrl: element,
            companyId,
            userId: entityShortenedUrl.userId,
            shortCode: generateShortCode(),
          }),
        )
      })
      await prismaService.shortenedUrl.createMany({
        data: entities.map(item => item.toJSON()),
      })
      const searchParams = {
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
        filter: 'TEST',
      }
      const queryParams = new URLSearchParams(searchParams as any).toString()

      const res = await request(app.getHttpServer())
        .get(`/shortened-url/?${queryParams}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(Object.keys(res.body)).toStrictEqual(['data', 'meta'])

      const expectedShortUrls = arrange.filter(url =>
        url.toLowerCase().includes('test'),
      )
      const resultShortUrls = res.body.data.map((item: any) => item.shortUrl)

      const lowerResultShortUrls = resultShortUrls.map(s => s.toLowerCase())
      expectedShortUrls.forEach(expected => {
        expect(lowerResultShortUrls).toContain(expected.toLowerCase())
      })

      expect(res.body.meta).toStrictEqual({
        total: 3,
        currentPage: 1,
        perPage: 2,
        lastPage: 2,
      })
    })

    it('should return a error with 422 code when the query params is invalid', async () => {
      const res = await request(app.getHttpServer())
        .get('/shortened-url/?fakeId=10')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual(['property fakeId should not exist'])
    })

    it('should return a error with 401 code when the request is not authorized', async () => {
      const res = await request(app.getHttpServer())
        .get('/shortened-url')
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        })
    })
  })
})
