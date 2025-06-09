import { CollectionPresenter } from '@/shared/infrastructure/presenters/collection.presenter'
import { UserOutput } from '@/users/application/dtos/user-output'
import { ListUsersUseCase } from '@/users/application/usecases/listusers.usecase'
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Transform } from 'class-transformer'

export class UserPresenter {
  @ApiProperty({ description: 'Identificação do usuário' })
  id: string

  @ApiProperty({ description: 'Identificação da Empresa' })
  companyId: string

  @ApiProperty({ description: 'Nome do usuário' })
  name: string

  @ApiProperty({ description: 'E-mail do usuário' })
  email: string

  @ApiProperty({ description: 'Data de criação do usuário' })
  @Transform(({ value }: { value: Date }) => value.toISOString())
  createdAt: Date

  @ApiProperty({ description: 'Data de atualização do usuário' })
  @Transform(({ value }: { value: Date }) => value.toISOString())
  updatedAt: Date

  @ApiProperty({ description: 'Data de exclusão do usuário' })
  deletedAt: Date | null

  @Exclude() password: string

  constructor(output: UserOutput) {
    this.id = output.id
    this.companyId = output.companyId
    this.name = output.name
    this.email = output.email
    this.createdAt = output.createdAt
    this.updatedAt = output.updatedAt
  }
}

export class UserCollectionPresenter extends CollectionPresenter {
  data: UserPresenter[]

  constructor(output: ListUsersUseCase.Output) {
    const { items, ...paginationProps } = output
    super(paginationProps)
    this.data = items.map(item => new UserPresenter(item))
  }
}
