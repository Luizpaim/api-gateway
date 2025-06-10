import { EntityValidationError } from '@/shared/domain/errors/validation-error'
import { ShortenedUrlValidatorFactory } from '@/shortened-url/domain/validators/shortened-url.validator'
import {
  ShortenedUrlProps,
  ShortenedUrlEntity,
} from '../../shortened-url.entity'

describe('ShortenedUrlEntity unit tests', () => {
  let props: ShortenedUrlProps
  let sut: ShortenedUrlEntity
  let validateSpy: jest.SpyInstance

  beforeEach(() => {
    validateSpy = jest
      .spyOn(ShortenedUrlEntity, 'validate')
      .mockImplementation(() => {})

    props = {
      companyId: '123e4567-e89b-12d3-a456-426614174000',
      userId: '223e4567-e89b-12d3-a456-426614174001',
      shortCode: 'ABC123',
      shortUrl: 'http://sho.rt',
      longUrl: 'https://example.com/path',
      visitsTotal: 7,
    }

    sut = new ShortenedUrlEntity(props)
  })

  it('should call validate on construction and set defaults', () => {
    expect(validateSpy).toHaveBeenCalledWith(props)
    expect(sut.props.shortCode).toBe(props.shortCode)
    expect(sut.props.shortUrl).toBe(props.shortUrl)
    expect(sut.props.longUrl).toBe(props.longUrl.trim())
    expect(sut.props.companyId).toBe(props.companyId)
    expect(sut.props.userId).toBe(props.userId)
    expect(sut.props.visitsTotal).toBe(props.visitsTotal)
    expect(sut.props.createdAt).toBeInstanceOf(Date)
    expect(sut.props.updatedAt).toBeInstanceOf(Date)
    expect(sut.props.deletedAt).toBeUndefined()
  })

  it('getters should return the corresponding props', () => {
    expect(sut.companyId).toBe(props.companyId)
    expect(sut.userId).toBe(props.userId)
    expect(sut.shortCode).toBe(props.shortCode)
    expect(sut.shortUrl).toBe(props.shortUrl)
    expect(sut.longUrl).toBe(props.longUrl.trim())
    expect(sut.visitsTotal).toBe(props.visitsTotal)
    expect(sut.createdAt).toBeInstanceOf(Date)
    expect(sut.updatedAt).toBeInstanceOf(Date)
    expect(sut.deletedAt).toBeUndefined()
  })

  it('private setters should update the underlying props', () => {
    const newDate = new Date(2000, 0, 1)
    ;(sut as any).shortCode = 'XYZ999'
    ;(sut as any).shortUrl = 'https://short.ly'
    ;(sut as any).longUrl = 'https://new.example.com'
    ;(sut as any).visitsTotal = 42
    ;(sut as any).updatedAt = newDate
    ;(sut as any).deletedAt = newDate

    expect(sut.props.shortCode).toBe('XYZ999')
    expect(sut.props.shortUrl).toBe('https://short.ly')
    expect(sut.props.longUrl).toBe('https://new.example.com')
    expect(sut.props.visitsTotal).toBe(42)
    expect(sut.props.updatedAt).toBe(newDate)
    expect(sut.props.deletedAt).toBe(newDate)
  })

  it('updateProps should validate, apply allowed updates and refresh updatedAt', () => {
    const before = sut.updatedAt
    const partial: Partial<ShortenedUrlProps> = {
      shortCode: 'NEW123',
      visitsTotal: 100,
      deletedAt: new Date(1999, 11, 31),
    }

    sut.updateProps(partial)

    expect(validateSpy).toHaveBeenCalledWith({ ...props, ...partial })
    expect(sut.props.shortCode).toBe('NEW123')
    expect(sut.props.visitsTotal).toBe(100)
    expect(sut.props.deletedAt).toBeInstanceOf(Date)
    expect(sut.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
  })

  it('updateProps should ignore undefined fields', () => {
    const beforeVisits = sut.visitsTotal
    sut.updateProps({ longUrl: undefined } as any)
    expect(sut.visitsTotal).toBe(beforeVisits)
  })

  it('static validate should throw EntityValidationError on invalid props', () => {
    validateSpy.mockRestore()
    jest.spyOn(ShortenedUrlValidatorFactory, 'create').mockReturnValue({
      validate: () => false,
      errors: { shortCode: ['error'] },
    } as any)

    expect(() => ShortenedUrlEntity.validate({} as any)).toThrow(
      EntityValidationError,
    )
  })
})
