import { ConflictError } from '@/shared/domain/errors/conflict-error'

import {
  ShortenedUrlEntity,
  ShortenedUrlProps,
} from '@/shortened-url/domain/entities/shortened-url.entity'
import { ShortenedUrlInMemoryRepository } from '../../shortened-url-in-memory.repository'

function makeProps(
  overrides: Partial<ShortenedUrlProps> = {},
): ShortenedUrlProps {
  return {
    shortCode: 'SC123',
    shortUrl: 'http://ex.com',
    longUrl: 'https://example.com',
    visitsTotal: 0,
    ...overrides,
  }
}

describe('ShortenedUrlInMemoryRepository unit tests', () => {
  let sut: ShortenedUrlInMemoryRepository

  beforeEach(() => {
    sut = new ShortenedUrlInMemoryRepository()
  })

  it('should throw ConflictError when shortCode already exists', async () => {
    const entity = new ShortenedUrlEntity(makeProps({ shortCode: 'DUPL01' }))
    await sut.insert(entity)
    await expect(sut.shortCodeExists('DUPL01')).rejects.toThrow(
      new ConflictError('ShortCode address already used'),
    )
  })

  it('should resolve when shortCode does not exist', async () => {
    await expect(sut.shortCodeExists('UNIQ01')).resolves.toBeUndefined()
  })

  it('should return all items when filter is null', async () => {
    const items = [
      new ShortenedUrlEntity(makeProps({ shortUrl: 'http://a.com' })),
      new ShortenedUrlEntity(makeProps({ shortUrl: 'http://b.com' })),
    ]
    await Promise.all(items.map(e => sut.insert(e)))
    const all = await sut.findAll()
    const spyFilter = jest.spyOn(all, 'filter')
    const filtered = await (sut as any).applyFilter(all, null)
    expect(spyFilter).not.toHaveBeenCalled()
    expect(filtered).toStrictEqual(all)
  })

  it('should filter items by shortUrl case-insensitive', async () => {
    const items = [
      new ShortenedUrlEntity(makeProps({ shortUrl: 'http://foo.com' })),
      new ShortenedUrlEntity(makeProps({ shortUrl: 'http://FOOBAR.com' })),
      new ShortenedUrlEntity(makeProps({ shortUrl: 'http://bar.com' })),
    ]
    const spyFilter = jest.spyOn(items, 'filter')
    const filtered = await (sut as any).applyFilter(items, 'foo')
    expect(spyFilter).toHaveBeenCalled()
    expect(filtered).toStrictEqual([items[0], items[1]])
  })

  describe('applySort', () => {
    it('should sort by createdAt desc when sort is null', async () => {
      const now = Date.now()
      const items = [
        new ShortenedUrlEntity(makeProps({ createdAt: new Date(now) })),
        new ShortenedUrlEntity(makeProps({ createdAt: new Date(now + 1) })),
        new ShortenedUrlEntity(makeProps({ createdAt: new Date(now + 2) })),
      ]
      const sorted = await (sut as any).applySort(items, null, null)
      expect(sorted).toStrictEqual([items[2], items[1], items[0]])
    })

    it('should not sort when sort field is not in sortableFields (shortUrl)', async () => {
      const items = [
        new ShortenedUrlEntity(makeProps({ shortUrl: 'http://c.com' })),
        new ShortenedUrlEntity(makeProps({ shortUrl: 'http://a.com' })),
        new ShortenedUrlEntity(makeProps({ shortUrl: 'http://b.com' })),
      ]
      const sorted = await (sut as any).applySort(items, 'shortUrl', 'asc')
      expect(sorted).toStrictEqual(items)
    })

    it('should not sort when sort field is not in sortableFields and sortDir is null (shortUrl)', async () => {
      const items = [
        new ShortenedUrlEntity(makeProps({ shortUrl: 'http://c.com' })),
        new ShortenedUrlEntity(makeProps({ shortUrl: 'http://a.com' })),
        new ShortenedUrlEntity(makeProps({ shortUrl: 'http://b.com' })),
      ]
      const sorted = await (sut as any).applySort(items, 'shortUrl', null)
      expect(sorted).toStrictEqual(items)
    })
  })
})
