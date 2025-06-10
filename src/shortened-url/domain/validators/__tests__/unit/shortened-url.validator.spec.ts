import { ShortenedUrlProps } from '@/shortened-url/domain/entities/shortened-url.entity'
import {
  ShortenedUrlValidator,
  ShortenedUrlValidatorFactory,
  ShortenedUrlRules,
} from '../../shortened-url.validator'

let sut: ShortenedUrlValidator
let props: ShortenedUrlProps

describe('ShortenedUrlValidator unit tests', () => {
  beforeEach(() => {
    sut = ShortenedUrlValidatorFactory.create()
    props = {
      shortCode: 'ABC123',
      shortUrl: 'http://sho.rt',
      longUrl: 'https://example.com/path',
      visitsTotal: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    }
  })

  it('Invalidation cases for companyId field', () => {
    let isValid = sut.validate({ ...props, companyId: '' } as any)
    expect(isValid).toBeFalsy()
    expect(sut.errors['companyId']).toStrictEqual(['companyId must be a UUID'])

    isValid = sut.validate({ ...props, companyId: 'not-a-uuid' } as any)
    expect(isValid).toBeFalsy()
    expect(sut.errors['companyId']).toStrictEqual(['companyId must be a UUID'])

    isValid = sut.validate({ ...props, companyId: 123 as any })
    expect(isValid).toBeFalsy()
    expect(sut.errors['companyId']).toStrictEqual(['companyId must be a UUID'])
  })

  it('Invalidation cases for userId field', () => {
    let isValid = sut.validate({ ...props, userId: '' } as any)
    expect(isValid).toBeFalsy()
    expect(sut.errors['userId']).toStrictEqual(['userId must be a UUID'])

    isValid = sut.validate({ ...props, userId: 'invalid-uuid' } as any)
    expect(isValid).toBeFalsy()
    expect(sut.errors['userId']).toStrictEqual(['userId must be a UUID'])
  })

  it('Invalidation cases for shortCode field', () => {
    let isValid = sut.validate(null as any)
    expect(isValid).toBeFalsy()
    expect(sut.errors['shortCode']).toStrictEqual([
      'shortCode should not be empty',
      'shortCode must be a string',
      'shortCode must be shorter than or equal to 6 characters',
    ])

    isValid = sut.validate({ ...props, shortCode: '' } as any)
    expect(isValid).toBeFalsy()
    expect(sut.errors['shortCode']).toStrictEqual([
      'shortCode should not be empty',
    ])

    isValid = sut.validate({ ...props, shortCode: 'TOO_LONG' } as any)
    expect(isValid).toBeFalsy()
    expect(sut.errors['shortCode']).toStrictEqual([
      'shortCode must be shorter than or equal to 6 characters',
    ])
  })

  it('Invalidation cases for shortUrl field', () => {
    let isValid = sut.validate(null as any)
    expect(isValid).toBeFalsy()
    expect(sut.errors['shortUrl']).toStrictEqual([
      'shortUrl should not be empty',
      'shortUrl must be a string',
      'shortUrl must be shorter than or equal to 100 characters',
    ])

    isValid = sut.validate({ ...props, shortUrl: '' } as any)
    expect(isValid).toBeFalsy()
    expect(sut.errors['shortUrl']).toStrictEqual([
      'shortUrl should not be empty',
    ])

    isValid = sut.validate({ ...props, shortUrl: 123 as any })
    expect(isValid).toBeFalsy()
    expect(sut.errors['shortUrl']).toStrictEqual([
      'shortUrl must be a string',
      'shortUrl must be shorter than or equal to 100 characters',
    ])
  })

  it('Invalidation cases for longUrl field', () => {
    let isValid = sut.validate(null as any)
    expect(isValid).toBeFalsy()
    expect(sut.errors['longUrl']).toStrictEqual([
      'longUrl must be a URL address',
      'longUrl should not be empty',
    ])

    isValid = sut.validate({ ...props, longUrl: '' } as any)
    expect(isValid).toBeFalsy()
    expect(sut.errors['longUrl']).toStrictEqual([
      'longUrl must be a URL address',
      'longUrl should not be empty',
    ])

    isValid = sut.validate({ ...props, longUrl: 'no-protocol.com' } as any)
    expect(isValid).toBeFalsy()
    expect(sut.errors['longUrl']).toStrictEqual([
      'longUrl must be a URL address',
    ])
  })

  it('Invalidation cases for visitsTotal field', () => {
    let isValid = sut.validate({ ...props, visitsTotal: 'NaN' as any })
    expect(isValid).toBeFalsy()
    expect(sut.errors['visitsTotal']).toStrictEqual([
      'visitsTotal must be a number conforming to the specified constraints',
    ])
  })

  it('Invalidation cases for createdAt field', () => {
    let isValid = sut.validate({ ...props, createdAt: 123 as any })
    expect(isValid).toBeFalsy()
    expect(sut.errors['createdAt']).toStrictEqual([
      'createdAt must be a Date instance',
    ])
  })

  it('Invalidation cases for updatedAt field', () => {
    let isValid = sut.validate({ ...props, updatedAt: '2025-01-01' as any })
    expect(isValid).toBeFalsy()
    expect(sut.errors['updatedAt']).toStrictEqual([
      'updatedAt must be a Date instance',
    ])
  })

  it('Invalidation cases for deletedAt field', () => {
    let isValid = sut.validate({ ...props, deletedAt: '2025-01-01' as any })
    expect(isValid).toBeFalsy()
    expect(sut.errors['deletedAt']).toStrictEqual([
      'deletedAt must be a Date instance',
    ])
  })

  it('Valid case for shortened URL rules', () => {
    const isValid = sut.validate(props)
    expect(isValid).toBeTruthy()
    expect(sut.validatedData).toStrictEqual(new ShortenedUrlRules(props))
  })
})
