import { UpdateCompanyUseCase } from '@/companies/application/usecases/update-company.usecase'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateCompanyDto implements Omit<UpdateCompanyUseCase.Input, 'id'> {
  @ApiProperty({ description: 'Nome do usuário' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'Categoria do usuário' })
  @IsString()
  category: string
}
