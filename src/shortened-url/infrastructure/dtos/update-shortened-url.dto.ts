import { UpdateShortenedUrlUseCase } from '@/shortened-url/application/usecases/update-shortened-url.usecase'
import { ApiProperty } from '@nestjs/swagger'

import { IsNotEmpty, IsUrl } from 'class-validator'

export class UpdateShortenedUrlDto
  implements
    Omit<UpdateShortenedUrlUseCase.Input, 'id' | 'companyId' | 'userId'>
{
  @ApiProperty({ description: 'Url original do usuário' })
  @IsUrl()
  @IsNotEmpty()
  longUrl: string
}
