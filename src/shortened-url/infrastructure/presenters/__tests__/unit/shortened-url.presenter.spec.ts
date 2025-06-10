import { instanceToPlain } from 'class-transformer'

import { ShortenedUrlOutput } from '@/shortened-url/application/dtos/shortened-url-output'
import { PaginationPresenter } from '@/shared/infrastructure/presenters/pagination.presenter'
import { ListShortenedUrlUseCase } from '@/shortened-url/application/usecases/list-shortened-url.usecase'
import {
  ShortenedUrlPresenter,
  ShortenedUrlCollectionPresenter,
} from '../../shortened-url.presenter'

describe('ShortenedUrlPresenter unit tests', () => {
  const createdAt = new Date()
  const updatedAt = new Date()
  const props: ShortenedUrlOutput = {
    id: 'id1',
    companyId: 'cid',
    userId: 'uid',
    longUrl: 'https://long.url/path',
    shortCode: 'SC1',
    shortUrl: 'http://short.ly/1',
    visitsTotal: 10,
    createdAt,
    updatedAt,
  }
  let sut: ShortenedUrlPresenter

  beforeEach(() => {
    sut = new ShortenedUrlPresenter(props)
  })

  it('should set properties correctly', () => {
    expect(sut.id).toBe(props.id)
    expect(sut.companyId).toBe(props.companyId)
    expect(sut.userId).toBe(props.userId)
    expect(sut.longUrl).toBe(props.longUrl)
    expect(sut.shortCode).toBe(props.shortCode)
    expect(sut.shortUrl).toBe(props.shortUrl)
    expect(sut.visitsTotal).toBe(props.visitsTotal)
    expect(sut.createdAt).toBe(props.createdAt)
    expect(sut.updatedAt).toBe(props.updatedAt)
  })

  it('should transform to plain object correctly', () => {
    const plain = instanceToPlain(sut)
    expect(plain).toStrictEqual({
      id: props.id,
      companyId: props.companyId,
      userId: props.userId,
      longUrl: props.longUrl,
      shortCode: props.shortCode,
      shortUrl: props.shortUrl,
      visitsTotal: props.visitsTotal,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    })
  })
})

describe('ShortenedUrlCollectionPresenter unit tests', () => {
  const createdAt = new Date()
  const updatedAt = new Date()
  const item: ShortenedUrlOutput = {
    id: 'id1',
    companyId: 'cid',
    userId: 'uid',
    longUrl: 'https://long.url/path',
    shortCode: 'SC1',
    shortUrl: 'http://short.ly/1',
    visitsTotal: 10,
    createdAt,
    updatedAt,
  }
  const searchOutput: ListShortenedUrlUseCase.Output = {
    items: [item],
    total: 1,
    currentPage: 1,
    perPage: 2,
    lastPage: 1,
  }

  it('should set meta and data correctly', () => {
    const sut = new ShortenedUrlCollectionPresenter(searchOutput)
    expect(sut.meta).toStrictEqual(
      new PaginationPresenter({
        total: 1,
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
      }),
    )
    expect(sut.data).toStrictEqual([new ShortenedUrlPresenter(item)])
  })

  it('should transform collection to plain object correctly', () => {
    const sut = new ShortenedUrlCollectionPresenter(searchOutput)
    const plain = instanceToPlain(sut)
    expect(plain).toStrictEqual({
      data: [
        {
          id: item.id,
          companyId: item.companyId,
          userId: item.userId,
          longUrl: item.longUrl,
          shortCode: item.shortCode,
          shortUrl: item.shortUrl,
          visitsTotal: item.visitsTotal,
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        },
      ],
      meta: {
        total: 1,
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
      },
    })
  })
})
