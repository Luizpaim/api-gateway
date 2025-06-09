import { Entity } from '@/shared/domain/entities/entity'
import { CompanyValidatorFactory } from '../validators/company.validator'
import { EntityValidationError } from '@/shared/domain/errors/validation-error'

export type CompanyProps = {
  name: string
  category: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

export class CompanyEntity extends Entity<CompanyProps> {
  constructor(
    public readonly props: CompanyProps,
    id?: string,
  ) {
    CompanyEntity.validate(props)
    super(props, id)
    this.props.createdAt = this.props.createdAt ?? new Date()
    this.props.updatedAt = this.props.updatedAt ?? new Date()
  }

  updateName(value: string): void {
    CompanyEntity.validate({
      ...this.props,
      name: value,
    })
    this.name = value
  }

  updateCategory(value: string): void {
    CompanyEntity.validate({
      ...this.props,
      category: value,
    })
    this.category = value
  }

  get name() {
    return this.props.name
  }

  private set name(value: string) {
    this.props.name = value
  }

  get category() {
    return this.props.category
  }

  private set category(value: string) {
    this.props.category = value
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.createdAt
  }

  get deletedAt() {
    return this.props.createdAt
  }

  static validate(props: CompanyProps) {
    const validator = CompanyValidatorFactory.create()
    const isValid = validator.validate(props)
    if (!isValid) {
      throw new EntityValidationError(validator.errors)
    }
  }
}
