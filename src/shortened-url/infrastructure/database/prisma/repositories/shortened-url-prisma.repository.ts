import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'
import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { ShortenedUrlEntity } from '@/shortened-url/domain/entities/shortened-url.entity'
import { ShortenedUrlRepository } from '@/shortened-url/domain/repositories/shortened-url.repository'
import { ShortenedUrlModelMapper } from '../models/shortened-url-model.mapper'
import { Prisma } from '@prisma/client'

export class ShortenedUrlPrismaRepository
  implements ShortenedUrlRepository.Repository
{
  sortableFields: string[] = ['shortUrl', 'createdAt']

  constructor(private prismaService: PrismaService) {}

  async shortCodeExists(shortCode: string): Promise<void> {
    const shortenedUrl = await this.prismaService.shortenedUrl.findUnique({
      where: { shortCode },
    })
    if (shortenedUrl) {
      throw new ConflictError(`ShortCode address already used`)
    }
  }

  async search(
    props: ShortenedUrlRepository.SearchParams,
  ): Promise<ShortenedUrlRepository.SearchResult> {
    const sortable = this.sortableFields?.includes(props.sort) || false
    const orderByField = sortable ? props.sort : 'createdAt'
    const orderByDir = sortable ? props.sortDir : 'desc'

    const where: Prisma.ShortenedUrlWhereInput = {
      companyId: props.companyId,
      userId: props.userId,
      deletedAt: null,
      ...(props.filter && {
        shortUrl: {
          contains: props.filter,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
    }

    const count = await this.prismaService.shortenedUrl.count({ where })

    const models = await this.prismaService.shortenedUrl.findMany({
      where,
      orderBy: {
        [orderByField]: orderByDir,
      },
      skip: props.page && props.page > 0 ? (props.page - 1) * props.perPage : 1,
      take: props.perPage && props.perPage > 0 ? props.perPage : 15,
    })

    return new ShortenedUrlRepository.SearchResult({
      items: models.map(model => ShortenedUrlModelMapper.toEntity(model)),
      total: count,
      currentPage: props.page,
      perPage: props.perPage,
      sort: orderByField,
      sortDir: orderByDir,
      filter: props.filter,
    })
  }

  async insert(entity: ShortenedUrlEntity): Promise<void> {
    await this.prismaService.shortenedUrl.create({
      data: entity.toJSON(),
    })
  }

  findById(
    id: string,
    companyId: string,
    userId: string,
  ): Promise<ShortenedUrlEntity> {
    return this._get({ id, companyId, userId })
  }

  async findAll(): Promise<ShortenedUrlEntity[]> {
    const models = await this.prismaService.shortenedUrl.findMany()
    return models.map(model => ShortenedUrlModelMapper.toEntity(model))
  }

  async update(entity: ShortenedUrlEntity): Promise<void> {
    await this._get({
      id: entity._id,
      companyId: entity.companyId,
      userId: entity.userId,
    })
    await this.prismaService.shortenedUrl.update({
      data: entity.toJSON(),
      where: {
        id: entity._id,
      },
    })
  }

  async delete(id: string, companyId: string, userId: string): Promise<void> {
    await this._get({ id, companyId, userId })
    await this.prismaService.shortenedUrl.update({
      data: {
        deletedAt: new Date(),
      },
      where: { id, companyId, userId },
    })
  }

  protected async _get({
    id,
    companyId,
    userId,
  }: {
    id: string
    companyId: string
    userId: string
  }): Promise<ShortenedUrlEntity> {
    try {
      const shortenedUrl = await this.prismaService.shortenedUrl.findUnique({
        where: { id, companyId, userId, deletedAt: null },
      })
      return ShortenedUrlModelMapper.toEntity(shortenedUrl)
    } catch {
      throw new NotFoundError(`ShortenedUrlModel not found using ID ${id}`)
    }
  }

  async runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.prismaService.$transaction(async () => {
      return fn()
    })
  }
}
