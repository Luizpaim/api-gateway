import { UserInMemoryRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { RedisCacheProvider } from '@/shared/application/providers/redis-cache.provider'
import { GetUserUseCase } from '@/users/application/usecases/getuser.usecase'

describe('GetUserUseCase unit tests', () => {
  let sut: GetUserUseCase.UseCase
  let repository: UserInMemoryRepository
  let redisCacheProvider: RedisCacheProvider

  beforeEach(() => {
    repository = new UserInMemoryRepository()

    redisCacheProvider = {
      getCache: jest.fn(),
      setCache: jest.fn(),
      delCache: jest.fn(),
    }

    sut = new GetUserUseCase.UseCase(repository, redisCacheProvider)
  })

  it('Should throws error when entity not found', async () => {
    await expect(() =>
      sut.execute({
        id: 'fakeId',
        companyId: 'df96ae94-6128-486e-840c-b6f78abb4802',
      }),
    ).rejects.toThrow(new NotFoundError('Entity not found'))
  })

  it('Should be able to get user profile', async () => {
    const spyFindById = jest.spyOn(repository, 'findById')
    const items = [new UserEntity(UserDataBuilder({}))]
    repository.items = items

    const result = await sut.execute({
      id: items[0]._id,
      companyId: items[0].companyId,
    })
    expect(spyFindById).toHaveBeenCalledTimes(1)
    expect(result).toMatchObject({
      id: items[0].id,
      name: items[0].name,
      email: items[0].email,
      password: items[0].password,
      createdAt: items[0].createdAt,
    })
  })
})
