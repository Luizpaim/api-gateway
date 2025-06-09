import { UpdateVisitsTotalUseCase } from '@/shortened-url/application/usecases/update-visits-total.usecase'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class UpdateVisitsTotalDto
  implements Omit<UpdateVisitsTotalUseCase.Input, 'id'>
{
  @ApiProperty({ description: 'Company Id do usuário' })
  @IsUUID()
  @IsNotEmpty()
  companyId: string

  @ApiProperty({ description: 'User Id do usuário' })
  @IsUUID()
  @IsNotEmpty()
  userId: string

  @ApiProperty({ description: 'Short Code da url' })
  @IsString()
  @IsNotEmpty()
  shortCode: string
}
