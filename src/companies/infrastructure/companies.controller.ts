import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Inject,
  HttpCode,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common'
import { SignupDto } from './dtos/signup.dto'
import { UpdateCompanyDto } from './dtos/update-company.dto'
import { SignupUseCase } from '../application/usecases/signup.usecase'
import { AuthGuard } from '@/auth/infrastructure/auth.guard'
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger'
import { UpdateCompanyUseCase } from '../application/usecases/update-company.usecase'
import { DeleteCompanyUseCase } from '../application/usecases/delete-company.usecase'
import { GetCompanyUseCase } from '../application/usecases/getcompany.usecase'
import { ListCompaniesUseCase } from '../application/usecases/listcompanies.usecase'
import { CompanyOutput } from '../application/dtos/company-output'
import {
  CompanyCollectionPresenter,
  CompanyPresenter,
} from './presenters/company.presenter'
import { ListCompaniesDto } from './dtos/list-companies.dto'

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  @Inject(SignupUseCase.UseCase)
  private signupUseCase: SignupUseCase.UseCase

  @Inject(UpdateCompanyUseCase.UseCase)
  private updateCompanyUseCase: UpdateCompanyUseCase.UseCase

  @Inject(DeleteCompanyUseCase.UseCase)
  private deleteCompanyUseCase: DeleteCompanyUseCase.UseCase

  @Inject(GetCompanyUseCase.UseCase)
  private getCompanyUseCase: GetCompanyUseCase.UseCase

  @Inject(ListCompaniesUseCase.UseCase)
  private listCompaniesUseCase: ListCompaniesUseCase.UseCase

  static companyToResponse(output: CompanyOutput) {
    return new CompanyPresenter(output)
  }

  static listCompaniesToResponse(output: ListCompaniesUseCase.Output) {
    return new CompanyCollectionPresenter(output)
  }

  @ApiResponse({
    status: 409,
    description: 'Conflito de nome',
  })
  @ApiResponse({
    status: 422,
    description: 'Corpo da requisição com dados inválidos',
  })
  @Post()
  async create(@Body() signupDto: SignupDto) {
    const output = await this.signupUseCase.execute(signupDto)
    return CompaniesController.companyToResponse(output)
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        meta: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
            },
            currentPage: {
              type: 'number',
            },
            lastPage: {
              type: 'number',
            },
            perPage: {
              type: 'number',
            },
          },
        },
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(CompanyPresenter) },
        },
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: 'Parâmetros de consulta inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado',
  })
  @UseGuards(AuthGuard)
  @Get()
  async search(@Query() searchParams: ListCompaniesDto) {
    const output = await this.listCompaniesUseCase.execute(searchParams)
    return CompaniesController.listCompaniesToResponse(output)
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 404,
    description: 'Id não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado',
  })
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const output = await this.getCompanyUseCase.execute({ id })
    return CompaniesController.companyToResponse(output)
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 422,
    description: 'Corpo da requisição com dados inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Id não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado',
  })
  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    const output = await this.updateCompanyUseCase.execute({
      id,
      ...updateCompanyDto,
    })
    return CompaniesController.companyToResponse(output)
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Resposta de confirmação da exclusão',
  })
  @ApiResponse({
    status: 404,
    description: 'Id não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado',
  })
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.deleteCompanyUseCase.execute({ id })
  }
}
