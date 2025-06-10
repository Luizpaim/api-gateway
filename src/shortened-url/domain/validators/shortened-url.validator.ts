import { ClassValidatorFields } from '@/shared/domain/validators/class-validator-fields'
import { ShortenedUrlProps } from '../entities/shortened-url.entity'
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator'

export class ShortenedUrlRules {
  @IsUUID()
  @IsOptional()
  companyId?: string

  @IsUUID()
  @IsOptional()
  userId?: string

  @MaxLength(6)
  @IsString()
  @IsNotEmpty()
  shortCode: string

  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  shortUrl: string

  @IsNotEmpty()
  @IsUrl({ require_protocol: true })
  longUrl: string

  @IsNumber()
  @IsOptional()
  maxVisits?: number | null

  @IsNumber()
  @IsOptional()
  visitsTotal?: number | null

  @IsDate()
  @IsOptional()
  createdAt?: Date

  @IsDate()
  @IsOptional()
  updatedAt?: Date

  @IsDate()
  @IsOptional()
  deletedAt?: Date | null

  constructor({
    companyId,
    userId,
    shortCode,
    shortUrl,
    longUrl,
    visitsTotal,
    createdAt,
    updatedAt,
    deletedAt,
  }: ShortenedUrlProps) {
    Object.assign(this, {
      companyId,
      userId,
      shortCode,
      shortUrl,
      longUrl: longUrl?.trim(),
      visitsTotal,
      createdAt,
      updatedAt,
      deletedAt,
    })
  }
}

export class ShortenedUrlValidator extends ClassValidatorFields<ShortenedUrlRules> {
  validate(data: ShortenedUrlRules): boolean {
    return super.validate(
      new ShortenedUrlRules(data ?? ({} as ShortenedUrlProps)),
    )
  }
}

export class ShortenedUrlValidatorFactory {
  static create(): ShortenedUrlValidator {
    return new ShortenedUrlValidator()
  }
}
