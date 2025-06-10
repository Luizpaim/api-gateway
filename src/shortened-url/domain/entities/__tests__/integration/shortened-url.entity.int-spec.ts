import { EntityValidationError } from '@/shared/domain/errors/validation-error'
import {
  ShortenedUrlProps,
  ShortenedUrlEntity,
} from '../../shortened-url.entity'

function makeProps(
  overrides: Partial<ShortenedUrlProps> = {},
): ShortenedUrlProps {
  return {
    shortCode: 'ABC123',
    shortUrl: 'http://sho.rt',
    longUrl: 'https://example.com/path',
    visitsTotal: 0,
    ...overrides,
  }
}

describe('ShortenedUrlEntity integration tests', () => {
  describe('Constructor method', () => {
    it('Should throw an error when creating with invalid shortCode', () => {
      expect(
        () => new ShortenedUrlEntity(makeProps({ shortCode: null as any })),
      ).toThrow(EntityValidationError)
      expect(
        () => new ShortenedUrlEntity(makeProps({ shortCode: '' })),
      ).toThrow(EntityValidationError)
      expect(
        () => new ShortenedUrlEntity(makeProps({ shortCode: 'TOO_LONG_CODE' })),
      ).toThrow(EntityValidationError)
    })

    it('Should throw an error when creating with invalid shortUrl', () => {
      expect(
        () => new ShortenedUrlEntity(makeProps({ shortUrl: null as any })),
      ).toThrow(EntityValidationError)
      expect(() => new ShortenedUrlEntity(makeProps({ shortUrl: '' }))).toThrow(
        EntityValidationError,
      )
    })

    it('Should throw an error when creating with invalid longUrl', () => {
      expect(
        () => new ShortenedUrlEntity(makeProps({ longUrl: null as any })),
      ).toThrow(EntityValidationError)
      expect(() => new ShortenedUrlEntity(makeProps({ longUrl: '' }))).toThrow(
        EntityValidationError,
      )
      expect(
        () => new ShortenedUrlEntity(makeProps({ longUrl: 'no-protocol.com' })),
      ).toThrow(EntityValidationError)
    })

    it('Should throw an error when creating with invalid visitsTotal', () => {
      expect(
        () => new ShortenedUrlEntity(makeProps({ visitsTotal: 'NaN' as any })),
      ).toThrow(EntityValidationError)
    })

    it('Should create a valid entity', () => {
      expect.assertions(0)
      const entity = new ShortenedUrlEntity(makeProps())
    })
  })

  describe('updateProps method', () => {
    it('Should throw an error when updating with invalid values', () => {
      const entity = new ShortenedUrlEntity(makeProps())
      expect(() => entity.updateProps({ shortCode: '' } as any)).toThrow(
        EntityValidationError,
      )
      expect(() => entity.updateProps({ longUrl: 'no-url' } as any)).toThrow(
        EntityValidationError,
      )
      expect(() =>
        entity.updateProps({ visitsTotal: 'NaN' as any } as any),
      ).toThrow(EntityValidationError)
    })

    it('Should update valid fields and refresh updatedAt', () => {
      const entity = new ShortenedUrlEntity(makeProps())
      const before = entity.updatedAt

      entity.updateProps({
        shortCode: 'NEW123',
        shortUrl: 'http://new.url',
        longUrl: 'https://new.com',
        visitsTotal: 5,
        deletedAt: new Date(2000, 0, 1),
      })

      expect(entity.shortCode).toBe('NEW123')
      expect(entity.shortUrl).toBe('http://new.url')
      expect(entity.longUrl).toBe('https://new.com')
      expect(entity.visitsTotal).toBe(5)
      expect(entity.deletedAt).toBeInstanceOf(Date)
      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      )
    })

    it('Should ignore undefined fields', () => {
      const entity = new ShortenedUrlEntity(makeProps())
      const beforeVisits = entity.visitsTotal
      entity.updateProps({ companyId: undefined } as any)
      expect(entity.visitsTotal).toBe(beforeVisits)
    })
  })
})
