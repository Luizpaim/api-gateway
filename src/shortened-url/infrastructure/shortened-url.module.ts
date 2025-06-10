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
import { ShortenedUrlProvider } from './providers/shortened-url-shlink.provider'
import { ShortenedUrlShlinkProvider } from '@/shared/application/providers/shortened-url-shlink.provider'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CompaniesModule,
    RedisCacheModule,
    HttpModule,
  ],
  controllers: [ShortenedUrlController],
  providers: [
    {
      provide: 'PrismaService',
      useClass: PrismaService,
    },
    {
      provide: 'ShortenedUrlShlinkProvider',
      useClass: ShortenedUrlProvider,
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
        shortenedUrlShlinkProvider: ShortenedUrlShlinkProvider,
      ) => {
        return new SignupShortenedUrlUseCase.UseCase(
          shortenedUrlRepository,
          shortenedUrlShlinkProvider,
        )
      },
      inject: ['ShortenedUrlRepository', 'ShortenedUrlShlinkProvider'],
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
        shortenedUrlShlinkProvider: ShortenedUrlShlinkProvider,
      ) => {
        return new UpdateShortenedUrlUseCase.UseCase(
          shortenedUrlRepository,
          shortenedUrlShlinkProvider,
        )
      },
      inject: ['ShortenedUrlRepository', 'ShortenedUrlShlinkProvider'],
    },
    {
      provide: UpdateVisitsTotalUseCase.UseCase,
      useFactory: (
        shortenedUrlRepository: ShortenedUrlRepository.Repository,
        shortenedUrlShlinkProvider: ShortenedUrlShlinkProvider,
      ) => {
        return new UpdateVisitsTotalUseCase.UseCase(
          shortenedUrlRepository,
          shortenedUrlShlinkProvider,
        )
      },
      inject: ['ShortenedUrlRepository', 'ShortenedUrlShlinkProvider'],
    },
    {
      provide: DeleteShortenedUrlUseCase.UseCase,
      useFactory: (
        shortenedUrlRepository: ShortenedUrlRepository.Repository,
        shortenedUrlShlinkProvider: ShortenedUrlShlinkProvider,
      ) => {
        return new DeleteShortenedUrlUseCase.UseCase(
          shortenedUrlRepository,
          shortenedUrlShlinkProvider,
        )
      },
      inject: ['ShortenedUrlRepository', 'ShortenedUrlShlinkProvider'],
    },
  ],
})
export class ShortenedUrlModule {}
