import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'
import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { CompanyRepository } from '@/companies/domain/repositories/company.repository'
import { CompanyModelMapper } from '../models/company-model.mapper'
import { CompanyEntity } from '@/companies/domain/entities/company.entity'

export class CompanyPrismaRepository implements CompanyRepository.Repository {
  sortableFields: string[] = ['name', 'createdAt']

  constructor(private prismaService: PrismaService) {}

  async nameExists(name: string): Promise<void> {
    const company = await this.prismaService.company.findFirst({
      where: { name },
    })
    if (company) {
      throw new ConflictError(`Name address already used`)
    }
  }

  async search(
    props: CompanyRepository.SearchParams,
  ): Promise<CompanyRepository.SearchResult> {
    const sortable = this.sortableFields?.includes(props.sort) || false
    const orderByField = sortable ? props.sort : 'createdAt'
    const orderByDir = sortable ? props.sortDir : 'desc'

    const count = await this.prismaService.company.count({
      ...(props.filter && {
        where: {
          name: {
            contains: props.filter,
            mode: 'insensitive',
          },
        },
      }),
    })

    const models = await this.prismaService.company.findMany({
      ...(props.filter && {
        where: {
          name: {
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

    return new CompanyRepository.SearchResult({
      items: models.map(model => CompanyModelMapper.toEntity(model)),
      total: count,
      currentPage: props.page,
      perPage: props.perPage,
      sort: orderByField,
      sortDir: orderByDir,
      filter: props.filter,
    })
  }

  async insert(entity: CompanyEntity): Promise<void> {
    await this.prismaService.company.create({
      data: entity.toJSON(),
    })
  }

  findById(id: string): Promise<CompanyEntity> {
    return this._get(id)
  }

  async findAll(): Promise<CompanyEntity[]> {
    const models = await this.prismaService.company.findMany()
    return models.map(model => CompanyModelMapper.toEntity(model))
  }

  async update(entity: CompanyEntity): Promise<void> {
    await this._get(entity._id)
    await this.prismaService.company.update({
      data: entity.toJSON(),
      where: {
        id: entity._id,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this._get(id)
    await this.prismaService.company.delete({
      where: { id },
    })
  }

  protected async _get(id: string): Promise<CompanyEntity> {
    try {
      const company = await this.prismaService.company.findUnique({
        where: { id },
      })
      return CompanyModelMapper.toEntity(company)
    } catch {
      throw new NotFoundError(`CompanyModel not found using ID ${id}`)
    }
  }
}
