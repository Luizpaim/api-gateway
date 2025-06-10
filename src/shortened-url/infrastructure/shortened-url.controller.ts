import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  HttpCode,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common'
import { AuthUser } from '@/auth/infrastructure/decorators/auth-user.decorator'
import { AuthGuard } from '@/auth/infrastructure/auth.guard'
import { OptionalAuthGuard } from '@/auth/infrastructure/optional-auth.guard'
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger'
import { SignupShortenedUrlUseCase } from '../application/usecases/signup-shortened-url.usecase'
import { UpdateShortenedUrlUseCase } from '../application/usecases/update-shortened-url.usecase'
import { UpdateVisitsTotalUseCase } from '../application/usecases/update-visits-total.usecase'
import { DeleteShortenedUrlUseCase } from '../application/usecases/delete-shortened-url.usecase'
import { GetShortenedUrlUseCase } from '../application/usecases/get-shortened-url.usecase'
import { ListShortenedUrlUseCase } from '../application/usecases/list-shortened-url.usecase'
import { ShortenedUrlOutput } from '../application/dtos/shortened-url-output'
import {
  ShortenedUrlCollectionPresenter,
  ShortenedUrlPresenter,
} from './presenters/shortened-url.presenter'
import { ListShortenedUrlDto } from './dtos/list-shortened-url.dto'
import { UpdateShortenedUrlDto } from './dtos/update-shortened-url.dto'

import { SignupShortenedUrlDto } from './dtos/signup-shortened-url.dto'

@ApiTags('shortened-url')
@Controller('shortened-url')
export class ShortenedUrlController {
  @Inject(SignupShortenedUrlUseCase.UseCase)
  private signupShortenedUrlUseCase: SignupShortenedUrlUseCase.UseCase

  @Inject(UpdateShortenedUrlUseCase.UseCase)
  private updateShortenedUrlUseCase: UpdateShortenedUrlUseCase.UseCase

  @Inject(UpdateVisitsTotalUseCase.UseCase)
  private updateVisitsTotalUseCase: UpdateVisitsTotalUseCase.UseCase

  @Inject(DeleteShortenedUrlUseCase.UseCase)
  private deleteShortenedUrlUseCase: DeleteShortenedUrlUseCase.UseCase

  @Inject(GetShortenedUrlUseCase.UseCase)
  private getShortenedUrlUseCase: GetShortenedUrlUseCase.UseCase

  @Inject(ListShortenedUrlUseCase.UseCase)
  private listShortenedUrlUseCase: ListShortenedUrlUseCase.UseCase

  static shortenedUrlToResponse(output: ShortenedUrlOutput) {
    return new ShortenedUrlPresenter(output)
  }

  static listShortenedUrlToResponse(output: ListShortenedUrlUseCase.Output) {
    return new ShortenedUrlCollectionPresenter(output)
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: 409,
    description: 'Conflito de ShortCode',
  })
  @ApiResponse({
    status: 422,
    description: 'Corpo da requisição com dados inválidos',
  })
  @UseGuards(OptionalAuthGuard)
  @Post()
  async create(
    @Body() signupDto: SignupShortenedUrlDto,
    @AuthUser() user: { id: string; companyId?: string },
  ) {
    const output = await this.signupShortenedUrlUseCase.execute({
      ...signupDto,
      companyId: user?.companyId,
      userId: user?.id,
    })
    return ShortenedUrlController.shortenedUrlToResponse(output)
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
          items: { $ref: getSchemaPath(ShortenedUrlPresenter) },
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
  async search(
    @Query() searchParams: ListShortenedUrlDto,
    @AuthUser() user: { id: string; companyId: string },
  ) {
    const output = await this.listShortenedUrlUseCase.execute({
      ...searchParams,
      companyId: user.companyId,
      userId: user.id,
    })
    return ShortenedUrlController.listShortenedUrlToResponse(output)
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
  async findOne(
    @Param('id') id: string,
    @AuthUser() user: { id: string; companyId?: string },
  ) {
    const output = await this.getShortenedUrlUseCase.execute({
      id,
      companyId: user.companyId,
      userId: user.id,
    })
    return ShortenedUrlController.shortenedUrlToResponse(output)
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
    @Body() updateShortenedUrlDto: UpdateShortenedUrlDto,
    @AuthUser() user: { id: string; companyId?: string },
  ) {
    const output = await this.updateShortenedUrlUseCase.execute({
      id,
      companyId: user.companyId,
      userId: user.id,
      ...updateShortenedUrlDto,
    })
    return ShortenedUrlController.shortenedUrlToResponse(output)
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
  @Patch(':id')
  async updateVisitsTotal(
    @Param('id') id: string,
    @AuthUser() user: { id: string; companyId?: string },
  ) {
    const output = await this.updateVisitsTotalUseCase.execute({
      id,
      userId: user.id,
      companyId: user.companyId,
    })
    return ShortenedUrlController.shortenedUrlToResponse(output)
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
  async remove(
    @Param('id') id: string,
    @AuthUser() user: { id: string; companyId?: string },
  ) {
    await this.deleteShortenedUrlUseCase.execute({
      id,
      companyId: user.companyId,
      userId: user.id,
    })
  }
}
