import { CompanyOutput } from '@/companies/application/dtos/company-output'
import { ListCompaniesUseCase } from '@/companies/application/usecases/listcompanies.usecase'
import { CollectionPresenter } from '@/shared/infrastructure/presenters/collection.presenter'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class CompanyPresenter {
  @ApiProperty({ description: 'Identificação do usuário' })
  id: string

  @ApiProperty({ description: 'Nome do usuário' })
  name: string

  @ApiProperty({ description: 'Categoria do usuário' })
  category: string

  @ApiProperty({ description: 'Data de criação do usuário' })
  @Transform(({ value }: { value: Date }) => value.toISOString())
  createdAt: Date

  @ApiProperty({ description: 'Data de atualização do usuário' })
  @Transform(({ value }: { value: Date }) => value.toISOString())
  updatedAt: Date

  @ApiProperty({ description: 'Data de exclusão do usuário' })
  deletedAt: Date | null

  constructor(output: CompanyOutput) {
    this.id = output.id
    this.name = output.name
    this.category = output.category
    this.createdAt = output.createdAt
    this.updatedAt = output.updatedAt
  }
}

export class CompanyCollectionPresenter extends CollectionPresenter {
  data: CompanyPresenter[]

  constructor(output: ListCompaniesUseCase.Output) {
    const { items, ...paginationProps } = output
    super(paginationProps)
    this.data = items.map(item => new CompanyPresenter(item))
  }
}
