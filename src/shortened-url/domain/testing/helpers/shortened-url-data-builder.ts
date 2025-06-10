import { faker } from '@faker-js/faker'
import { ShortenedUrlProps } from '../../entities/shortened-url.entity'

type Props = {
  companyId?: string
  userId?: string
  shortCode?: string
  shortUrl?: string
  longUrl?: string
  visitsTotal?: number
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

export function ShortenedUrlDataBuilder(props: Props): ShortenedUrlProps {
  return {
    companyId: props.companyId ?? faker.string.uuid(),
    userId: props.userId ?? faker.string.uuid(),
    shortCode: props.shortCode ?? faker.string.alphanumeric(6),
    shortUrl: props.shortUrl ?? faker.internet.url(),
    longUrl: props.longUrl ?? faker.internet.url(),
    visitsTotal: props.visitsTotal ?? 0,
    createdAt: props.createdAt ?? new Date(),
    updatedAt: props.updatedAt ?? new Date(),
    deletedAt: props.deletedAt ?? null,
  }
}
