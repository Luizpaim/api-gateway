import { ShortenedUrlEntity } from '@/shortened-url/domain/entities/shortened-url.entity'

export type ShortenedUrlOutput = {
  id: string
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

export class ShortenedUrlOutputMapper {
  static toOutput(entity: ShortenedUrlEntity): ShortenedUrlOutput {
    return entity.toJSON()
  }
}
