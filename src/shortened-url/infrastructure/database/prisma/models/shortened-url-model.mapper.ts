import { ValidationError } from '@/shared/domain/errors/validation-error'
import { ShortenedUrlEntity } from '@/shortened-url/domain/entities/shortened-url.entity'
import { ShortenedUrl } from '@prisma/client'

export class ShortenedUrlModelMapper {
  static toEntity(model: ShortenedUrl) {
    const data = {
      companyId: model.companyId,
      userId: model.userId,
      shortCode: model.shortCode,
      shortUrl: model.shortUrl,
      longUrl: model.longUrl,
      visitsTotal: model.visitsTotal,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }

    try {
      return new ShortenedUrlEntity(data, model.id)
    } catch {
      throw new ValidationError('An entity not be loaded')
    }
  }
}
