import { DatabaseModule } from '@/shared/infrastructure/database/database.module'
import { setupPrismaTests } from '@/shared/infrastructure/database/prisma/testing/setup-prisma-tests'
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository'
import { Test, TestingModule } from '@nestjs/testing'
import { Company, PrismaClient } from '@prisma/client'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { UpdateUserUseCase } from '../../update-user.usecase'
import { WebsocketProvider } from '@/shared/application/providers/websocket-provider'

describe('UpdateUserUseCase integration tests', () => {
  const prismaService = new PrismaClient()
  let sut: UpdateUserUseCase.UseCase
  let repository: UserPrismaRepository
  let module: TestingModule
  let websocketProvider: jest.Mocked<WebsocketProvider>
  let company: Company

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
    repository = new UserPrismaRepository(prismaService as any)
  })

  beforeEach(async () => {
    websocketProvider = {
      sendMessage: jest.fn(),
      handleConnection: jest.fn(),
      handleDisconnect: jest.fn(),
      broadcastPublicMessage: jest.fn(),
    }
    company = await prismaService.company.create({
      data: {
        name: 'Acme Corp',
        category: 'Tech',
      },
    })
    sut = new UpdateUserUseCase.UseCase(repository, websocketProvider)
    await prismaService.user.deleteMany()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should throws error when entity not found', async () => {
    await expect(() =>
      sut.execute({ id: 'fakeId', name: 'fake name' }),
    ).rejects.toThrow(new NotFoundError('UserModel not found using ID fakeId'))
  })

  it('should update a user', async () => {
    const entity = new UserEntity(UserDataBuilder({
      companyId: company.id,
      deletedAt: null,
    }))
    const model = await prismaService.user.create({
      data: entity.toJSON(),
    })

    const spyWebsocket = jest.spyOn(websocketProvider, 'broadcastPublicMessage')

    const output = await sut.execute({ id: entity._id, name: 'new name' })
    expect(spyWebsocket).toHaveBeenCalledTimes(1)
    expect(output.name).toBe('new name')
  })
})
