import { CompanyEntity } from '@/companies/domain/entities/company.entity'
import { ValidationError } from '@/shared/domain/errors/validation-error'

import { Company } from '@prisma/client'

export class CompanyModelMapper {
  static toEntity(model: Company) {
    const data = {
      name: model.name,
      category: model.category,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }

    try {
      return new CompanyEntity(data, model.id)
    } catch {
      throw new ValidationError('An entity not be loaded')
    }
  }
}
