import { Entity } from '@/shared/domain/entities/entity'
import { UserValidatorFactory } from '../validators/user.validator'
import { EntityValidationError } from '@/shared/domain/errors/validation-error'

export type UserProps = {
  name: string
  email: string
  password: string
  companyId: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

export class UserEntity extends Entity<UserProps> {
  constructor(
    public readonly props: UserProps,
    id?: string,
  ) {
    UserEntity.validate(props)
    super(props, id)
    this.props.createdAt = this.props.createdAt ?? new Date()
    this.props.updatedAt = this.props.updatedAt ?? new Date()
  }

  update(value: string): void {
    UserEntity.validate({
      ...this.props,
      name: value,
    })
    this.name = value
  }

  updatePassword(value: string): void {
    UserEntity.validate({
      ...this.props,
      password: value,
    })
    this.password = value
  }

  refreshUpdatedAt(value: Date): void {
    UserEntity.validate({
      ...this.props,
      updatedAt: value,
    })
    this.updatedAt = value
  }

  setDeletedAt(value: Date): void {
    UserEntity.validate({
      ...this.props,
      deletedAt: value,
    })
    this.deletedAt = value
  }

  get companyId() {
    return this.props.companyId
  }

  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get password() {
    return this.props.password
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

  private set name(value: string) {
    this.props.name = value
  }

  private set password(value: string) {
    this.props.password = value
  }

  private set updatedAt(value: Date) {
    this.props.updatedAt = value
  }

  private set deletedAt(value: Date) {
    this.props.deletedAt = value
  }

  static validate(props: UserProps) {
    const validator = UserValidatorFactory.create()
    const isValid = validator.validate(props)
    if (!isValid) {
      throw new EntityValidationError(validator.errors)
    }
  }
}
