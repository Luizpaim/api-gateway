import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { SignupUseCase } from '../application/usecases/signup.usecase'
import { BcryptjsHashProvider } from './providers/hash-provider/bcryptjs-hash.provider'
import { UserRepository } from '../domain/repositories/user.repository'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { SigninUseCase } from '../application/usecases/signin.usecase'
import { GetUserUseCase } from '../application/usecases/getuser.usecase'
import { ListUsersUseCase } from '../application/usecases/listusers.usecase'
import { UpdateUserUseCase } from '../application/usecases/update-user.usecase'
import { UpdatePasswordUseCase } from '../application/usecases/update-password.usecase'
import { DeleteUserUseCase } from '../application/usecases/delete-user.usecase'
import { PrismaService } from '@/shared/infrastructure/database/prisma/prisma.service'
import { UserPrismaRepository } from './database/prisma/repositories/user-prisma.repository'
import { AuthModule } from '@/auth/infrastructure/auth.module'
import { KafkaProvider } from '@/shared/application/providers/kafka-provider'
import { KafkaModule } from '@/shared/infrastructure/kafka/kafka.module'
import { WebsocketProvider } from '@/shared/application/providers/websocket-provider'
import { WebsocketModule } from '@/shared/infrastructure/websocket/websocket.module'
import { RedisCacheModule } from '@/shared/infrastructure/redis-cache/redis-cache.module'
import { RedisCacheProvider } from '@/shared/application/providers/redis-cache.provider'

@Module({
  imports: [AuthModule, KafkaModule, WebsocketModule, RedisCacheModule],
  controllers: [UsersController],
  providers: [
    {
      provide: 'PrismaService',
      useClass: PrismaService,
    },
    {
      provide: 'UserRepository',
      useFactory: (prismaService: PrismaService) => {
        return new UserPrismaRepository(prismaService)
      },
      inject: ['PrismaService'],
    },
    {
      provide: 'HashProvider',
      useClass: BcryptjsHashProvider,
    },
    {
      provide: SignupUseCase.UseCase,
      useFactory: (
        userRepository: UserRepository.Repository,
        hashProvider: HashProvider,
        kafkaProvider: KafkaProvider,
      ) => {
        return new SignupUseCase.UseCase(
          userRepository,
          hashProvider,
          kafkaProvider,
        )
      },
      inject: ['UserRepository', 'HashProvider', 'KafkaProvider'],
    },
    {
      provide: SigninUseCase.UseCase,
      useFactory: (
        userRepository: UserRepository.Repository,
        hashProvider: HashProvider,
      ) => {
        return new SigninUseCase.UseCase(userRepository, hashProvider)
      },
      inject: ['UserRepository', 'HashProvider'],
    },
    {
      provide: GetUserUseCase.UseCase,
      useFactory: (
        userRepository: UserRepository.Repository,
        redisCacheProvider: RedisCacheProvider,
      ) => {
        return new GetUserUseCase.UseCase(userRepository, redisCacheProvider)
      },
      inject: ['UserRepository', 'RedisCacheProvider'],
    },
    {
      provide: ListUsersUseCase.UseCase,
      useFactory: (userRepository: UserRepository.Repository) => {
        return new ListUsersUseCase.UseCase(userRepository)
      },
      inject: ['UserRepository'],
    },
    {
      provide: UpdateUserUseCase.UseCase,
      useFactory: (
        userRepository: UserRepository.Repository,
        websocketProvider: WebsocketProvider,
      ) => {
        return new UpdateUserUseCase.UseCase(userRepository, websocketProvider)
      },
      inject: ['UserRepository', 'WebsocketProvider'],
    },
    {
      provide: UpdatePasswordUseCase.UseCase,
      useFactory: (
        userRepository: UserRepository.Repository,
        hashProvider: HashProvider,
      ) => {
        return new UpdatePasswordUseCase.UseCase(userRepository, hashProvider)
      },
      inject: ['UserRepository', 'HashProvider'],
    },
    {
      provide: DeleteUserUseCase.UseCase,
      useFactory: (userRepository: UserRepository.Repository) => {
        return new DeleteUserUseCase.UseCase(userRepository)
      },
      inject: ['UserRepository'],
    },
  ],
})
export class UsersModule {}
