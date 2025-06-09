import { UpdateUserUseCase } from '@/users/application/usecases/update-user.usecase'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateUserDto
  implements Omit<UpdateUserUseCase.Input, 'id' | 'companyId'>
{
  @ApiProperty({ description: 'Nome do usuário' })
  @IsString()
  @IsNotEmpty()
  name: string
}
