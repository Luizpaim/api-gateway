import { SignupUseCase } from '@/users/application/usecases/signup.usecase'
import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class SignupUserDto implements SignupUseCase.Input {
  @ApiProperty({ description: 'Company Id do usuário' })
  @IsUUID()
  @IsNotEmpty()
  companyId: string

  @ApiProperty({ description: 'Nome do usuário' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'E-mail do usuário' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({ description: 'Senha do usuário' })
  @IsString()
  @IsNotEmpty()
  password: string
}
