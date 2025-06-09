import { UpdateShortenedUrlUseCase } from '@/shortened-url/application/usecases/update-shortened-url.usecase'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class UpdateShortenedUrlDto
  implements Omit<UpdateShortenedUrlUseCase.Input, 'id'>
{
  @ApiProperty({ description: 'Company Id do usuário' })
  @IsUUID()
  @IsNotEmpty()
  companyId: string

  @ApiProperty({ description: 'User Id do usuário' })
  @IsUUID()
  @IsNotEmpty()
  userId: string

  @ApiProperty({ description: 'Url original do usuário' })
  @IsString()
  @IsNotEmpty()
  longUrl: string

  @ApiProperty({ description: 'Data inicio validade da Url' })
  @IsString()
  validSince: Date

  @ApiProperty({ description: 'Data fim validade da Url' })
  @IsString()
  validUntil: Date

  @ApiProperty({ description: 'Data inicio validade da Url' })
  @IsString()
  maxVisits: number
}
