import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'
import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { ShortenedUrlEntity } from '@/shortened-url/domain/entities/shortened-url.entity'
import { ShortenedUrlRepository } from '@/shortened-url/domain/repositories/shortened-url.repository'
import { ShortenedUrlModelMapper } from '../models/shortened-url-model.mapper'

export class ShortenedUrlPrismaRepository
  implements ShortenedUrlRepository.Repository
{
  sortableFields: string[] = ['name', 'createdAt']

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
    console.log('search props', props)
    const count = await this.prismaService.shortenedUrl.count({
      ...(props.filter && {
        where: {
          shortUrl: {
            contains: props.filter,
            mode: 'insensitive',
          },
        },
      }),
    })

    const models = await this.prismaService.shortenedUrl.findMany({
      ...(props.filter && {
        where: {
          shortUrl: {
            contains: props.filter,
            mode: 'insensitive',
          },
        },
      }),
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

  findById(id: string): Promise<ShortenedUrlEntity> {
    return this._get(id)
  }

  async findAll(): Promise<ShortenedUrlEntity[]> {
    const models = await this.prismaService.shortenedUrl.findMany()
    return models.map(model => ShortenedUrlModelMapper.toEntity(model))
  }

  async update(entity: ShortenedUrlEntity): Promise<void> {
    await this._get(entity._id)
    await this.prismaService.shortenedUrl.update({
      data: entity.toJSON(),
      where: {
        id: entity._id,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this._get(id)
    await this.prismaService.shortenedUrl.update({
      data: {
        deletedAt: new Date(),
      },
      where: { id },
    })
  }

  protected async _get(id: string): Promise<ShortenedUrlEntity> {
    try {
      const user = await this.prismaService.shortenedUrl.findUnique({
        where: { id },
      })
      return ShortenedUrlModelMapper.toEntity(user)
    } catch {
      throw new NotFoundError(`ShortenedUrlModel not found using ID ${id}`)
    }
  }
}
