import { faker } from '@faker-js/faker'
import { CompanyProps } from '../../entities/company.entity'

type Props = {
  name?: string
  category?: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

export function CompanyDataBuilder(props: Props): CompanyProps {
  return {
    name: props.name ?? faker.person.fullName(),
    category: props.category ?? 'new category',
    createdAt: props.createdAt ?? new Date(),
    updatedAt: props.createdAt ?? new Date(),
    deletedAt: props.createdAt ?? new Date(),
  }
}
