import { SignupShortenedUrlUseCase } from '@/shortened-url/application/usecases/signup-shortened-url.usecase'
import { ApiProperty } from '@nestjs/swagger'

import { IsNotEmpty, IsUrl } from 'class-validator'

export class SignupShortenedUrlDto implements SignupShortenedUrlUseCase.Input {
  @ApiProperty({ description: 'Url original do usuário' })
  @IsUrl({ require_protocol: true })
  @IsNotEmpty()
  longUrl: string
}
