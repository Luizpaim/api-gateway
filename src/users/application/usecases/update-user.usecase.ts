import { UserRepository } from '@/users/domain/repositories/user.repository'
import { UserOutput, UserOutputMapper } from '../dtos/user-output'
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { BadRequestError } from '@/shared/application/errors/bad-request-error'
import { WebsocketProvider } from '@/shared/application/providers/websocket-provider'

export namespace UpdateUserUseCase {
  export type Input = {
    id: string
    companyId: string
    name: string
  }

  export type Output = UserOutput

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly userRepository: UserRepository.Repository,
      private readonly websocketProvider: WebsocketProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      if (!input.name) {
        throw new BadRequestError('Name not provided')
      }
      const entity = await this.userRepository.findById(
        input.id,
        input.companyId,
      )

      entity.update(input.name)

      await this.userRepository.update(entity)

      const user = UserOutputMapper.toOutput(entity)

      this.websocketProvider.broadcastPublicMessage({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        event: 'update-user',
        userId: user.id,
      })

      return user
    }
  }
}
