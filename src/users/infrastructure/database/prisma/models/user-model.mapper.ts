import { ValidationError } from '@/shared/domain/errors/validation-error'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { User } from '@prisma/client'

export class UserModelMapper {
  static toEntity(model: User) {
    const data = {
      companyId: model.companyId,
      name: model.name,
      email: model.email,
      password: model.password,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    }

    try {
      return new UserEntity(data, model.id)
    } catch {
      throw new ValidationError('An entity not be loaded')
    }
  }
}
