import { UserRepository } from '@/users/domain/repositories/user.repository'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { SignupUserDto } from '../../dtos/signup.dto'
import { PrismaClient } from '@prisma/client'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { EnvConfigModule } from '@/shared/infrastructure/env-config/env-config.module'
import { UsersModule } from '../../users.module'
import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import request from 'supertest'
import { UsersController } from '../../users.controller'
import { instanceToPlain } from 'class-transformer'
import { applyGlobalConfig } from '@/global-config'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { ClientKafka, Transport } from '@nestjs/microservices'
import { CompaniesModule } from '@/companies/infrastructure/companies.module'

describe('UsersController e2e tests', () => {
  jest.setTimeout(60000)

  let app: INestApplication
  let module: TestingModule

  let repository: UserRepository.Repository
  let signupDto: SignupUserDto
  let companyId: string

  let kafkaClient: ClientKafka
  const prismaService = new PrismaClient()

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

    kafkaClient = module.get<ClientKafka>('KAFKA_PRODUCER')

    await kafkaClient.connect()
    app = module.createNestApplication()
    applyGlobalConfig(app)

    app.connectMicroservice({
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
        },
        consumer: {
          groupId: 'api-gateway-consumer',
        },
      },
    })

    await app.startAllMicroservices()
    await app.init()

    kafkaClient = module.get<ClientKafka>('KAFKA_PRODUCER')
    await kafkaClient.connect()

    repository = module.get<UserRepository.Repository>('UserRepository')
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

    signupDto = {
      name: 'test name',
      email: 'a@a.com',
      password: 'TestPassword123',
      companyId,
    }
  })

  afterAll(async () => {
    await kafkaClient.close()
    await app.close()
    await new Promise(res => setTimeout(res, 500))
  })

  describe('POST /users', () => {
    it('should create a user', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(201)
      expect(Object.keys(res.body)).toStrictEqual(['data'])
      const user = await repository.findById(res.body.data.id)
      const presenter = UsersController.userToResponse(user.toJSON())
      const serialized = instanceToPlain(presenter)
      expect(res.body.data).toStrictEqual(serialized)
    })

    it('should return a error with 422 code when the request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send({})
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'companyId should not be empty',
        'companyId must be a UUID',
        'name should not be empty',
        'name must be a string',
        'email must be an email',
        'email should not be empty',
        'email must be a string',
        'password should not be empty',
        'password must be a string',
      ])
    })

    it('should return a error with 422 code when the name field is invalid', async () => {
      delete signupDto.name
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'name should not be empty',
        'name must be a string',
      ])
    })

    it('should return a error with 422 code when the email field is invalid', async () => {
      delete signupDto.email
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'email must be an email',
        'email should not be empty',
        'email must be a string',
      ])
    })

    it('should return a error with 422 code when the password field is invalid', async () => {
      delete signupDto.password
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ])
    })

    it('should return a error with 422 code when the companyId field is invalid', async () => {
      delete signupDto.companyId
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'companyId should not be empty',
        'companyId must be a UUID',
      ])
    })

    it('should return a error with 422 code with invalid field provided', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(Object.assign(signupDto, { xpto: 'fake' }))
        .expect(422)
      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual(['property xpto should not exist'])
    })

    it('should return a error with 409 code when the email is duplicated', async () => {
      const entity = new UserEntity(UserDataBuilder({ ...signupDto }))
      await repository.insert(entity)
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(signupDto)
        .expect(409)
        .expect({
          statusCode: 409,
          error: 'Conflict',
          message: 'Email address already used',
        })
    })
  })
})
