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
import { UpdateUserDto } from '../../dtos/update-user.dto'
import { BcryptjsHashProvider } from '../../providers/hash-provider/bcryptjs-hash.provider'
import { UsersController } from '../../users.controller'
import { UsersModule } from '../../users.module'
import { CompaniesModule } from '@/companies/infrastructure/companies.module'

describe('UsersController e2e tests', () => {
  let app: INestApplication
  let module: TestingModule

  let repository: UserRepository.Repository
  let updateUserDto: UpdateUserDto
  let entity: UserEntity
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
        CompaniesModule,
        DatabaseModule.forTest(prismaService),
      ],
    })
      .overrideProvider('WebsocketProvider')
      .useValue({
        sendMessage: jest.fn(),
        handleConnection: jest.fn(),
        handleDisconnect: jest.fn(),
        broadcastPublicMessage: jest.fn(),
      })
      .compile()
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

    const res = await request(app.getHttpServer())
      .post('/companies')
      .send(signupCompanyDto)
      .expect(201)

    companyId = res.body.data.id

    updateUserDto = {
      name: 'test name',
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
  })

  describe('PUT /users/:id', () => {
    it('should update a user', async () => {
      updateUserDto.name = 'test name'
      const res = await request(app.getHttpServer())
        .put(`/users/${entity._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateUserDto)
        .expect(200)
      const user = await repository.findById(entity._id)
      const presenter = UsersController.userToResponse(user.toJSON())
      const serialized = instanceToPlain(presenter)
      expect(res.body.data).toStrictEqual(serialized)
    })

    it('should return a error with 422 code when the request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .put(`/users/${entity._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'name should not be empty',
        'name must be a string',
      ])
    })

    it('should return a error with 404 code when throw NotFoundError with invalid id', async () => {
      const res = await request(app.getHttpServer())
        .put('/users/fakeId')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateUserDto)
        .expect(404)
        .expect({
          statusCode: 404,
          error: 'Not Found',
          message: 'UserModel not found using ID fakeId',
        })
    })

    it('should return a error with 401 code when the request is not authorized', async () => {
      const res = await request(app.getHttpServer())
        .put('/users/fakeId')
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Unauthorized',
        })
    })
  })
})
