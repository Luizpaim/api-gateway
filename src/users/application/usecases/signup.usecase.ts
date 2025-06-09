import { UserRepository } from '@/users/domain/repositories/user.repository'
import { BadRequestError } from '../../../shared/application/errors/bad-request-error'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { UserOutput, UserOutputMapper } from '../dtos/user-output'
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { KafkaProvider } from '@/shared/application/providers/kafka-provider'

export namespace SignupUseCase {
  export type Input = {
    companyId: string
    name: string
    email: string
    password: string
  }

  export type Output = UserOutput

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly userRepository: UserRepository.Repository,
      private readonly hashProvider: HashProvider,
      private readonly kafkaProvider: KafkaProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const { email, name, password, companyId } = input

      if (!email || !name || !password || !companyId) {
        throw new BadRequestError('Input data not provided')
      }

      await this.userRepository.emailExists(email)

      const hashPassword = await this.hashProvider.generateHash(password)

      const entity = new UserEntity(
        Object.assign(input, { password: hashPassword }),
      )

      await this.userRepository.insert(entity)
      const user = UserOutputMapper.toOutput(entity)

      this.kafkaProvider.publishEvent({
        eventName: 'user.created',
        data: {
          id: user.id,
          companyId: user.companyId,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      })

      return user
    }
  }
}
