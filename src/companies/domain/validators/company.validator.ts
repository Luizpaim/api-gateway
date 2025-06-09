import { ClassValidatorFields } from '@/shared/domain/validators/class-validator-fields'
import { CompanyProps } from '../entities/company.entity'
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export class CompanyRules {
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string

  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  category: string

  @IsDate()
  @IsOptional()
  createdAt?: Date

  @IsDate()
  @IsOptional()
  updatedAt?: Date

  @IsDate()
  @IsOptional()
  deletedAt?: Date

  constructor({
    name,
    category,
    createdAt,
    updatedAt,
    deletedAt,
  }: CompanyProps) {
    Object.assign(this, { name, category, createdAt, updatedAt, deletedAt })
  }
}

export class CompanyValidator extends ClassValidatorFields<CompanyRules> {
  validate(data: CompanyRules): boolean {
    return super.validate(new CompanyRules(data ?? ({} as CompanyProps)))
  }
}

export class CompanyValidatorFactory {
  static create(): CompanyValidator {
    return new CompanyValidator()
  }
}
