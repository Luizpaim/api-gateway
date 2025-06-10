import { UserInMemoryRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { BadRequestError } from '@/shared/application/errors/bad-request-error'
import { WebsocketProvider } from '@/shared/application/providers/websocket-provider'
import { UpdateUserUseCase } from '@/users/application/usecases/update-user.usecase'

describe('UpdateUserUseCase unit tests', () => {
  let sut: UpdateUserUseCase.UseCase
  let repository: UserInMemoryRepository
  let websocketProvider: WebsocketProvider

  beforeEach(() => {
    websocketProvider = {
      sendMessage: jest.fn(),
      handleConnection: jest.fn(),
      handleDisconnect: jest.fn(),
      broadcastPublicMessage: jest.fn(),
    }

    repository = new UserInMemoryRepository()
    sut = new UpdateUserUseCase.UseCase(repository, websocketProvider)
  })

  it('Should throws error when entity not found', async () => {
    await expect(() =>
      sut.execute({
        id: 'fakeId',
        name: 'test name',
        companyId: 'df96ae94-6128-486e-840c-b6f78abb4802',
      }),
    ).rejects.toThrow(new NotFoundError('Entity not found'))
  })

  it('Should throws error when name not provided', async () => {
    await expect(() =>
      sut.execute({
        id: 'fakeId',
        name: '',
        companyId: 'df96ae94-6128-486e-840c-b6f78abb4802',
      }),
    ).rejects.toThrow(new BadRequestError('Name not provided'))
  })

  it('Should update a user', async () => {
    const spyUpdate = jest.spyOn(repository, 'update')
    const spyWebsocket = jest.spyOn(websocketProvider, 'broadcastPublicMessage')

    const items = [new UserEntity(UserDataBuilder({}))]
    repository.items = items

    const result = await sut.execute({
      id: items[0]._id,
      name: 'new name',
      companyId: items[0].companyId,
    })
    expect(spyUpdate).toHaveBeenCalledTimes(1)
    expect(spyWebsocket).toHaveBeenCalledTimes(1)
    expect(result).toMatchObject({
      id: items[0].id,
      name: 'new name',
      email: items[0].email,
      password: items[0].password,
      createdAt: items[0].createdAt,
    })
  })
})
