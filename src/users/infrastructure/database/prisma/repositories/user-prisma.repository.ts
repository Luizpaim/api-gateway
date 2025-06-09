import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserRepository } from '@/users/domain/repositories/user.repository'
import { UserModelMapper } from '../models/user-model.mapper'
import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { Prisma } from '@prisma/client'

export class UserPrismaRepository implements UserRepository.Repository {
  sortableFields: string[] = ['name', 'createdAt']

  constructor(private prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      })
      return UserModelMapper.toEntity(user)
    } catch {
      throw new NotFoundError(`UserModel not found using email ${email}`)
    }
  }

  async emailExists(email: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    })
    if (user) {
      throw new ConflictError(`Email address already used`)
    }
  }

  async search(
    props: UserRepository.SearchParams,
  ): Promise<UserRepository.SearchResult> {
    const sortable = this.sortableFields?.includes(props.sort) || false
    const orderByField = sortable ? props.sort : 'createdAt'
    const orderByDir = sortable ? props.sortDir : 'desc'

    const where: Prisma.UserWhereInput = {
      companyId: props.companyId,
      deletedAt: null,
      ...(props.filter && {
        name: {
          contains: props.filter,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
    }

    const count = await this.prismaService.user.count({ where })

    const models = await this.prismaService.user.findMany({
      where,
      orderBy: {
        [orderByField]: orderByDir,
      },
      skip: props.page && props.page > 0 ? (props.page - 1) * props.perPage : 0,
      take: props.perPage && props.perPage > 0 ? props.perPage : 15,
    })

    return new UserRepository.SearchResult({
      items: models.map(model => UserModelMapper.toEntity(model)),
      total: count,
      currentPage: props.page,
      perPage: props.perPage,
      sort: orderByField,
      sortDir: orderByDir,
      filter: props.filter,
    })
  }

  async insert(entity: UserEntity): Promise<void> {
    await this.prismaService.user.create({
      data: entity.toJSON(),
    })
  }

  findById(id: string, companyId: string): Promise<UserEntity> {
    return this._get(id, companyId)
  }

  async findAll(): Promise<UserEntity[]> {
    const models = await this.prismaService.user.findMany()
    return models.map(model => UserModelMapper.toEntity(model))
  }

  async update(entity: UserEntity): Promise<void> {
    await this._get(entity._id, entity.companyId)
    await this.prismaService.user.update({
      data: entity.toJSON(),
      where: {
        id: entity._id,
      },
    })
  }

  async delete(id: string, companyId: string): Promise<void> {
    await this._get(id, companyId)
    await this.prismaService.user.update({
      data: {
        deletedAt: new Date(),
      },
      where: { id },
    })
  }

  protected async _get(id: string, companyId: string): Promise<UserEntity> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id, companyId, deletedAt: null },
      })
      return UserModelMapper.toEntity(user)
    } catch {
      throw new NotFoundError(`UserModel not found using ID ${id}`)
    }
  }
}
