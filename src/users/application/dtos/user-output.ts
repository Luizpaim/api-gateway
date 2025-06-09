import { UserEntity } from '@/users/domain/entities/user.entity'

export type UserOutput = {
  id: string
  companyId: string
  name: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export class UserOutputMapper {
  static toOutput(entity: UserEntity): UserOutput {
    return entity.toJSON()
  }
}
