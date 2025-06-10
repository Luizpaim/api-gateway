import { Entity } from '@/shared/domain/entities/entity'
import { ShortenedUrlValidatorFactory } from '../validators/shortened-url.validator'
import { EntityValidationError } from '@/shared/domain/errors/validation-error'

export type ShortenedUrlProps = {
  companyId?: string
  userId?: string
  shortCode: string
  shortUrl: string
  longUrl: string
  visitsTotal?: number
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

export class ShortenedUrlEntity extends Entity<ShortenedUrlProps> {
  constructor(
    public readonly props: ShortenedUrlProps,
    id?: string,
  ) {
    ShortenedUrlEntity.validate(props)
    super(props, id)
    this.props.createdAt = this.props.createdAt ?? new Date()
    this.props.updatedAt = this.props.updatedAt ?? new Date()
  }

  get companyId() {
    return this.props.companyId
  }

  get userId() {
    return this.props.userId
  }

  get shortCode() {
    return this.props.shortCode
  }

  get shortUrl() {
    return this.props.shortUrl
  }

  get longUrl() {
    return this.props.longUrl
  }

  get visitsTotal() {
    return this.props.visitsTotal
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get deletedAt() {
    return this.props.deletedAt
  }

  private set companyId(value: string) {
    this.props.companyId = value
  }

  private set userId(value: string) {
    this.props.userId = value
  }

  private set shortCode(value: string) {
    this.props.shortCode = value
  }

  private set shortUrl(value: string) {
    this.props.shortUrl = value
  }

  private set longUrl(value: string) {
    this.props.longUrl = value
  }

  private set visitsTotal(value: number) {
    this.props.visitsTotal = value
  }

  private set updatedAt(value: Date) {
    this.props.updatedAt = value
  }

  private set deletedAt(value: Date) {
    this.props.deletedAt = value
  }

  updateProps(input: Partial<ShortenedUrlProps>): void {
    ShortenedUrlEntity.validate({ ...this.props, ...input })

    const setters = {
      shortCode: (v: string) => (this.shortCode = v),
      shortUrl: (v: string) => (this.shortUrl = v),
      longUrl: (v: string) => (this.longUrl = v),
      visitsTotal: (v: number) => (this.visitsTotal = v),
      deletedAt: (v: Date) => (this.deletedAt = v),
    }

    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined && key in setters) {
        setters[key](value)
      }
    })

    this.updatedAt = new Date()
  }

  static validate(props: ShortenedUrlProps) {
    const validator = ShortenedUrlValidatorFactory.create()
    const isValid = validator.validate(props)
    if (!isValid) {
      throw new EntityValidationError(validator.errors)
    }
  }
}
