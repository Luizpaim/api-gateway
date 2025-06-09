import { Module } from '@nestjs/common'
import { SignupUseCase } from '../application/usecases/signup.usecase'
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'
import { AuthModule } from '@/auth/infrastructure/auth.module'
import { RedisCacheModule } from '@/shared/infrastructure/redis-cache/redis-cache.module'
import { RedisCacheProvider } from '@/shared/application/providers/redis-cache.provider'
import { CompaniesController } from './companies.controller'
import { CompanyPrismaRepository } from './database/prisma/repositories/company-prisma.repository'
import { CompanyRepository } from '../domain/repositories/company.repository'
import { GetCompanyUseCase } from '../application/usecases/getcompany.usecase'
import { ListCompaniesUseCase } from '../application/usecases/listcompanies.usecase'
import { UpdateCompanyUseCase } from '../application/usecases/update-company.usecase'
import { DeleteCompanyUseCase } from '../application/usecases/delete-company.usecase'

@Module({
  imports: [AuthModule, RedisCacheModule],
  controllers: [CompaniesController],
  providers: [
    {
      provide: 'PrismaService',
      useClass: PrismaService,
    },
    {
      provide: 'CompanyRepository',
      useFactory: (prismaService: PrismaService) => {
        return new CompanyPrismaRepository(prismaService)
      },
      inject: ['PrismaService'],
    },
    {
      provide: SignupUseCase.UseCase,
      useFactory: (companyRepository: CompanyRepository.Repository) => {
        return new SignupUseCase.UseCase(companyRepository)
      },
      inject: ['CompanyRepository'],
    },
    {
      provide: GetCompanyUseCase.UseCase,
      useFactory: (
        companyRepository: CompanyRepository.Repository,
        redisCacheProvider: RedisCacheProvider,
      ) => {
        return new GetCompanyUseCase.UseCase(
          companyRepository,
          redisCacheProvider,
        )
      },
      inject: ['CompanyRepository', 'RedisCacheProvider'],
    },
    {
      provide: ListCompaniesUseCase.UseCase,
      useFactory: (companyRepository: CompanyRepository.Repository) => {
        return new ListCompaniesUseCase.UseCase(companyRepository)
      },
      inject: ['CompanyRepository'],
    },
    {
      provide: UpdateCompanyUseCase.UseCase,
      useFactory: (companyRepository: CompanyRepository.Repository) => {
        return new UpdateCompanyUseCase.UseCase(companyRepository)
      },
      inject: ['CompanyRepository'],
    },

    {
      provide: DeleteCompanyUseCase.UseCase,
      useFactory: (companyRepository: CompanyRepository.Repository) => {
        return new DeleteCompanyUseCase.UseCase(companyRepository)
      },
      inject: ['CompanyRepository'],
    },
  ],
})
export class CompaniesModule {}
