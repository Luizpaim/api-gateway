import { SignupShortenedUrlUseCase } from '@/shortened-url/application/usecases/signup-shortened-url.usecase'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsNumber } from 'class-validator'

export class SignupShortenedUrlDto implements SignupShortenedUrlUseCase.Input {
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
  @IsNumber()
  maxVisits: number
}
