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

import { v4 as uuidv4 } from 'uuid'

describe('ShortenedUrlController e2e tests', () => {
  let app: INestApplication
  let module: TestingModule
  let repository: UserRepository.Repository
  let entity: UserEntity
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
  })

  describe('DELETE /shortened-url/:id', () => {
    it('should return a error with 401 code when the request is not authorized', async () => {
      const res = await request(app.getHttpServer())
        .delete('/shortened-url/baa2e7bc-de38-4d7c-bd57-1dbaa226ca4e')
        .expect(401)

      expect(res.body).toEqual(
        expect.objectContaining({
          statusCode: 401,
          message: 'Unauthorized',
        }),
      )
    })

    it('should return a error with 404 code when throw NotFoundError with invalid id', async () => {
      const nonExistentId = uuidv4()
      const res = await request(app.getHttpServer())
        .delete(`/shortened-url/${nonExistentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)

      expect(res.body).toEqual(
        expect.objectContaining({
          statusCode: 404,
          error: 'Not Found',
        }),
      )
      expect(res.body.message).toMatch(/^ShortenedUrlModel not found using ID/)
    })

    it('should remove a user', async () => {
      resShortenedUrl = await request(app.getHttpServer())
        .post('/shortened-url')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          longUrl: 'https://longurl.com/teste',
        })
        .expect(201)

      const res = await request(app.getHttpServer())
        .delete(`/shortened-url/${resShortenedUrl.body.data.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204)
        .expect({})
    })
  })
})
