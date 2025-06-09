import { ClassValidatorFields } from '@/shared/domain/validators/class-validator-fields'
import { UserProps } from '../entities/user.entity'
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator'

export class UserRules {
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string

  @MaxLength(255)
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string

  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  password: string

  @IsUUID()
  @IsNotEmpty()
  companyId: string

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
    email,
    name,
    password,
    createdAt,
    updatedAt,
    deletedAt,
    companyId,
  }: UserProps) {
    Object.assign(this, {
      email,
      name,
      password,
      createdAt,
      updatedAt,
      deletedAt,
      companyId,
    })
  }
}

export class UserValidator extends ClassValidatorFields<UserRules> {
  validate(data: UserRules): boolean {
    return super.validate(new UserRules(data ?? ({} as UserProps)))
  }
}

export class UserValidatorFactory {
  static create(): UserValidator {
    return new UserValidator()
  }
}
