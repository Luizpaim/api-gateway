import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module'
import { ShortenedUrlModule } from '../../shortened-url.module'
import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { applyGlobalConfig } from '@/global-config'
import { ShortenedUrlController } from '../../shortened-url.controller'
import { instanceToPlain } from 'class-transformer'
import { OptionalAuthGuard } from '@/auth/infrastructure/optional-auth.guard'
import { AuthGuard } from '@/auth/infrastructure/auth.guard'

describe('ShortenedUrlController e2e tests for CREATE', () => {
  jest.setTimeout(60000)

  let app: INestApplication
  let module: TestingModule
  let prisma: PrismaClient

  let signupDto: any

  beforeAll(async () => {
    setupPrismaTests()
    prisma = new PrismaClient()

    module = await Test.createTestingModule({
      imports: [
        EnvConfigModule,
        ShortenedUrlModule,
        DatabaseModule.forTest(prisma),
      ],
    })
      .overrideGuard('AuthGuard')
      .useClass(AuthGuard)
      .overrideGuard('OptionalAuthGuard')
      .useClass(OptionalAuthGuard)
      .compile()

    app = module.createNestApplication()
    applyGlobalConfig(app)
    await app.init()
  })

  beforeEach(async () => {
    await prisma.shortenedUrl.deleteMany()
    signupDto = {
      longUrl: 'https://longurl.com/teste',
    }
  })

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
    await new Promise(res => setTimeout(res, 300))
  })

  describe('POST /shortened-url', () => {
    it('should create and return shortcut data', async () => {
      const res = await request(app.getHttpServer())
        .post('/shortened-url')
        .send(signupDto)
        .expect(201)

      expect(Object.keys(res.body.data)).toStrictEqual([
        'id',
        'shortCode',
        'shortUrl',
        'longUrl',
        'createdAt',
        'updatedAt',
      ])
      expect(res.body.data.longUrl).toBe(signupDto.longUrl)

      const entity = await prisma.shortenedUrl.findUnique({
        where: { id: res.body.data.id },
      })

      expect(entity).toBeTruthy()
      const presenter = ShortenedUrlController.shortenedUrlToResponse(entity)
      const serialized = instanceToPlain(presenter)
      expect(res.body.data.longUrl).toBe(serialized.longUrl)
      expect(res.body.data.shortCode).toBe(serialized.shortCode)
    })

    it('should return 422 on invalid payload', async () => {
      const res = await request(app.getHttpServer())
        .post('/shortened-url')
        .send({})
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'longUrl should not be empty',
        'longUrl must be a URL address',
      ])
    })

    it('should return 422 if field is invalid', async () => {
      delete signupDto.longUrl
      const res = await request(app.getHttpServer())
        .post('/shortened-url')
        .send(signupDto)
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'longUrl should not be empty',
        'longUrl must be a URL address',
      ])
    })

    it('should return 422 with extra property', async () => {
      const res = await request(app.getHttpServer())
        .post('/shortened-url')
        .send({ ...signupDto, xpto: 'fake' })
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual(['property xpto should not exist'])
    })
  })
})
