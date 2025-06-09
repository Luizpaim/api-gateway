import { faker } from '@faker-js/faker'
import { UserProps } from '../../entities/user.entity'

type Props = {
  name?: string
  email?: string
  password?: string
  companyId?: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

export function UserDataBuilder(props: Props): UserProps {
  return {
    companyId: props.companyId ?? faker.string.uuid(),
    name: props.name ?? faker.person.fullName(),
    email: props.email ?? faker.internet.email(),
    password: props.password ?? faker.internet.password(),
    createdAt: props.createdAt ?? new Date(),
    updatedAt: props.updatedAt ?? new Date(),
    deletedAt: props.deletedAt ?? null,
  }
}
