import { instanceToPlain } from 'class-transformer'
import { UserCollectionPresenter, UserPresenter } from '../../user.presenter'
import { PaginationPresenter } from '@/shared/infrastructure/presenters/pagination.presenter'

describe('UserPresenter unit tests', () => {
  const createdAt = new Date()
  const updatedAt = new Date()

  const props = {
    id: 'e71c52a2-9710-4a96-a08e-144af4209b5d',
    companyId: 'e71c52a2-9710-4a96-a08e-144af4209b5d',
    name: 'test name',
    email: 'a@a.com',
    password: 'fake', // será excluído na serialização
    createdAt,
    updatedAt,
  }

  let sut: UserPresenter

  beforeEach(() => {
    sut = new UserPresenter(props)
  })

  describe('constructor', () => {
    it('should set values', () => {
      expect(sut.id).toEqual(props.id)
      expect(sut.companyId).toEqual(props.companyId)
      expect(sut.name).toEqual(props.name)
      expect(sut.email).toEqual(props.email)
      expect(sut.createdAt).toEqual(props.createdAt)
      expect(sut.updatedAt).toEqual(props.updatedAt)
    })
  })

  it('should presenter data', () => {
    const output = instanceToPlain(sut)
    expect(output).toStrictEqual({
      id: props.id,
      companyId: props.companyId,
      name: props.name,
      email: props.email,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    })
  })
})

describe('UserCollectionPresenter unit tests', () => {
  const createdAt = new Date()
  const updatedAt = new Date()

  const props = {
    id: 'e71c52a2-9710-4a96-a08e-144af4209b5d',
    companyId: 'e71c52a2-9710-4a96-a08e-144af4209b5d',
    name: 'test name',
    email: 'a@a.com',
    password: 'fake',
    createdAt,
    updatedAt,
  }

  describe('constructor', () => {
    it('should set values', () => {
      const sut = new UserCollectionPresenter({
        items: [props],
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 1,
      })

      expect(sut.meta).toBeInstanceOf(PaginationPresenter)
      expect(sut.meta).toStrictEqual(
        new PaginationPresenter({
          currentPage: 1,
          perPage: 2,
          lastPage: 1,
          total: 1,
        }),
      )

      expect(sut.data).toStrictEqual([new UserPresenter(props)])
    })
  })

  it('should presenter data', () => {
    const sut = new UserCollectionPresenter({
      items: [props],
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
      total: 1,
    })

    const output = instanceToPlain(sut)

    expect(output).toStrictEqual({
      data: [
        {
          id: props.id,
          companyId: props.companyId,
          name: props.name,
          email: props.email,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        },
      ],
      meta: {
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 1,
      },
    })
  })
})
