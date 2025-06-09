import { CollectionPresenter } from '@/shared/infrastructure/presenters/collection.presenter'
import { ShortenedUrlOutput } from '@/shortened-url/application/dtos/shortened-url-output'
import { ListShortenedUrlUseCase } from '@/shortened-url/application/usecases/list-shortened-url.usecase'
import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'

export class ShortenedUrlPresenter {
  @ApiProperty({ description: 'Identificação do usuário' })
  id: string

  @ApiProperty({ description: 'Identificação da Empresa' })
  companyId: string

  @ApiProperty({ description: 'Identificação do Usuário' })
  userId: string

  @ApiProperty({ description: 'Url Original' })
  longUrl: string

  @ApiProperty({ description: 'ShortCode Url' })
  shortCode: string

  @ApiProperty({ description: 'Url encurtada' })
  shortUrl: string

  @ApiProperty({ description: 'Máximo de visitas permitido para  Url' })
  maxVisits: number

  @ApiProperty({ description: 'Total de visitas para  Url ' })
  visitsTotal: number

  @ApiProperty({ description: 'Data inicio validade da Url' })
  validSince: Date

  @ApiProperty({ description: 'Data inicio validade da Url' })
  validUntil: Date

  @ApiProperty({ description: 'Data de criação do usuário' })
  @Transform(({ value }: { value: Date }) => value.toISOString())
  createdAt: Date

  @ApiProperty({ description: 'Data de atualização do usuário' })
  @Transform(({ value }: { value: Date }) => value.toISOString())
  updatedAt: Date

  @ApiProperty({ description: 'Data de exclusão do usuário' })
  deletedAt: Date | null

  constructor(output: ShortenedUrlOutput) {
    this.id = output.id
    this.companyId = output.companyId
    this.userId = output.userId
    this.shortCode = output.shortCode
    this.shortUrl = output.shortUrl
    this.longUrl = output.longUrl
    this.validSince = output.validSince
    this.validUntil = output.validUntil
    this.maxVisits = output.maxVisits
    this.visitsTotal = output.visitsTotal
    this.createdAt = output.createdAt
    this.updatedAt = output.updatedAt
  }
}

export class ShortenedUrlCollectionPresenter extends CollectionPresenter {
  data: ShortenedUrlPresenter[]

  constructor(output: ListShortenedUrlUseCase.Output) {
    const { items, ...paginationProps } = output
    super(paginationProps)
    this.data = items.map(item => new ShortenedUrlPresenter(item))
  }
}
