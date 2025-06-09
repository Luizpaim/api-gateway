import { instanceToPlain } from 'class-transformer'
import { PaginationPresenter } from '@/shared/infrastructure/presenters/pagination.presenter'
import {
  CompanyPresenter,
  CompanyCollectionPresenter,
} from '../../company.presenter'

describe('CompanyPresenter unit tests', () => {
  const createdAt = new Date()
  const updatedAt = new Date()
  const props = {
    id: 'e71c52a2-9710-4a96-a08e-144af4209b5d',
    name: 'test name',
    category: 'a@a.com',
    createdAt,
    updatedAt,
    deletedAt: null,
  }
  let sut: CompanyPresenter

  beforeEach(() => {
    sut = new CompanyPresenter(props)
  })

  describe('constructor', () => {
    it('should set values', () => {
      expect(sut.id).toEqual(props.id)
      expect(sut.name).toEqual(props.name)
      expect(sut.category).toEqual(props.category)
      expect(sut.createdAt).toEqual(props.createdAt)
      expect(sut.updatedAt).toEqual(props.updatedAt)
    })
  })

  it('should presenter data', () => {
    const output = instanceToPlain(sut)
    expect(output).toStrictEqual({
      id: 'e71c52a2-9710-4a96-a08e-144af4209b5d',
      name: 'test name',
      category: 'a@a.com',
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    })
  })
})

describe('CompanyCollectionPresenter unit tests', () => {
  const createdAt = new Date()
  const updatedAt = new Date()
  const props = {
    id: 'e71c52a2-9710-4a96-a08e-144af4209b5d',
    name: 'test name',
    category: 'a@a.com',
    createdAt,
    updatedAt,
  }

  describe('constructor', () => {
    it('should set values', () => {
      const sut = new CompanyCollectionPresenter({
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
      expect(sut.data).toStrictEqual([new CompanyPresenter(props)])
    })
  })

  it('should presenter data', () => {
    let sut = new CompanyCollectionPresenter({
      items: [props],
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
      total: 1,
    })
    let output = instanceToPlain(sut)
    expect(output).toStrictEqual({
      data: [
        {
          id: 'e71c52a2-9710-4a96-a08e-144af4209b5d',
          name: 'test name',
          category: 'a@a.com',
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

    sut = new CompanyCollectionPresenter({
      items: [props],
      currentPage: '1' as any,
      perPage: '2' as any,
      lastPage: '1' as any,
      total: '1' as any,
    })
    output = instanceToPlain(sut)
    expect(output).toStrictEqual({
      data: [
        {
          id: 'e71c52a2-9710-4a96-a08e-144af4209b5d',
          name: 'test name',
          category: 'a@a.com',
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
