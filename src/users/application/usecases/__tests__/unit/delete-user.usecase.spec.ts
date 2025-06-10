import { UserInMemoryRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { DeleteUserUseCase } from '../../delete-user.usecase'

describe('DeleteUserUseCase unit tests', () => {
  let sut: DeleteUserUseCase.UseCase
  let repository: UserInMemoryRepository

  beforeEach(() => {
    repository = new UserInMemoryRepository()
    sut = new DeleteUserUseCase.UseCase(repository)
  })

  it('Should throws error when entity not found', async () => {
    await expect(() =>
      sut.execute({ id: 'fakeId', companyId: 'e6bfa6da-8bd6-4d28-8cb3-80ed3790a294' }),
    ).rejects.toThrow(new NotFoundError('Entity not found'))
  })

  it('Should delete a user', async () => {
    const spyDelete = jest.spyOn(repository, 'delete')
    const items = [
      new UserEntity(
        UserDataBuilder({ companyId: 'e6bfa6da-8bd6-4d28-8cb3-80ed3790a294', deletedAt: new Date() }),
      ),
    ]
    repository.items = items

    expect(repository.items).toHaveLength(1)
    await sut.execute({
      id: items[0]._id,
      companyId: 'company',
    })
    expect(spyDelete).toHaveBeenCalledTimes(1)
    expect(repository.items).toHaveLength(0)
  })
})
