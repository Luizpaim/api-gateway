import { AuthModule } from '@/auth/infrastructure/auth.module'
import { CompaniesModule } from '@/companies/infrastructure/companies.module'
import { RedisCacheProvider } from '@/shared/application/providers/redis-cache.provider'
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'
import { RedisCacheModule } from '@/shared/infrastructure/redis-cache/redis-cache.module'
import { UsersModule } from '@/users/infrastructure/users.module'
import { Module } from '@nestjs/common'
import { ShortenedUrlController } from './shortened-url.controller'
import { ShortenedUrlPrismaRepository } from './database/prisma/repositories/shortened-url-prisma.repository'
import { SignupShortenedUrlUseCase } from '../application/usecases/signup-shortened-url.usecase'
import { ShortenedUrlRepository } from '../domain/repositories/shortened-url.repository'
import { GetShortenedUrlUseCase } from '../application/usecases/get-shortened-url.usecase'
import { ListShortenedUrlUseCase } from '../application/usecases/list-shortened-url.usecase'
import { UpdateShortenedUrlUseCase } from '../application/usecases/update-shortened-url.usecase'
import { UpdateVisitsTotalUseCase } from '../application/usecases/update-visits-total.usecase'
import { DeleteShortenedUrlUseCase } from '../application/usecases/delete-shortened-url.usecase'

@Module({
  imports: [AuthModule, UsersModule, CompaniesModule, RedisCacheModule],
  controllers: [ShortenedUrlController],
  providers: [
    {
      provide: 'PrismaService',
      useClass: PrismaService,
    },
    {
      provide: 'ShortenedUrlRepository',
      useFactory: (prismaService: PrismaService) => {
        return new ShortenedUrlPrismaRepository(prismaService)
      },
      inject: ['PrismaService'],
    },
    {
      provide: SignupShortenedUrlUseCase.UseCase,
      useFactory: (
        shortenedUrlRepository: ShortenedUrlRepository.Repository,
      ) => {
        return new SignupShortenedUrlUseCase.UseCase(shortenedUrlRepository)
      },
      inject: ['ShortenedUrlRepository'],
    },

    {
      provide: GetShortenedUrlUseCase.UseCase,
      useFactory: (
        shortenedUrlRepository: ShortenedUrlRepository.Repository,
        redisCacheProvider: RedisCacheProvider,
      ) => {
        return new GetShortenedUrlUseCase.UseCase(
          shortenedUrlRepository,
          redisCacheProvider,
        )
      },
      inject: ['ShortenedUrlRepository', 'RedisCacheProvider'],
    },
    {
      provide: ListShortenedUrlUseCase.UseCase,
      useFactory: (
        shortenedUrlRepository: ShortenedUrlRepository.Repository,
      ) => {
        return new ListShortenedUrlUseCase.UseCase(shortenedUrlRepository)
      },
      inject: ['ShortenedUrlRepository'],
    },
    {
      provide: UpdateShortenedUrlUseCase.UseCase,
      useFactory: (
        shortenedUrlRepository: ShortenedUrlRepository.Repository,
      ) => {
        return new UpdateShortenedUrlUseCase.UseCase(shortenedUrlRepository)
      },
      inject: ['ShortenedUrlRepository'],
    },
    {
      provide: UpdateVisitsTotalUseCase.UseCase,
      useFactory: (
        shortenedUrlRepository: ShortenedUrlRepository.Repository,
      ) => {
        return new UpdateVisitsTotalUseCase.UseCase(shortenedUrlRepository)
      },
      inject: ['ShortenedUrlRepository'],
    },
    {
      provide: DeleteShortenedUrlUseCase.UseCase,
      useFactory: (
        shortenedUrlRepository: ShortenedUrlRepository.Repository,
      ) => {
        return new DeleteShortenedUrlUseCase.UseCase(shortenedUrlRepository)
      },
      inject: ['ShortenedUrlRepository'],
    },
  ],
})
export class ShortenedUrlModule {}
