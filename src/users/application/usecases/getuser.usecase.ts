import { UserRepository } from '@/users/domain/repositories/user.repository'
import { UserOutput, UserOutputMapper } from '../dtos/user-output'
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { RedisCacheProvider } from '@/shared/application/providers/redis-cache.provider'

export namespace GetUserUseCase {
  export type Input = {
    id: string
    companyId: string
  }

  export type Output = UserOutput

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly userRepository: UserRepository.Repository,
      private readonly redisCacheProvider: RedisCacheProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const cacheKey = `user:${input.id}-${input.companyId}`

      const userCached =
        await this.redisCacheProvider.getCache<UserOutput>(cacheKey)

      if (userCached) return userCached

      const entity = await this.userRepository.findById(
        input.id,
        input.companyId,
      )

      const user = UserOutputMapper.toOutput(entity)

      await this.redisCacheProvider.setCache({ cacheKey, data: user, time: 60 })

      return user
    }
  }
}
