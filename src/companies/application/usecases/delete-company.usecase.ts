import { CompanyRepository } from '@/companies/domain/repositories/company.repository'
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'

export namespace DeleteCompanyUseCase {
  export type Input = {
    id: string
  }

  export type Output = void

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly companyRepository: CompanyRepository.Repository,
    ) {}

    async execute(input: Input): Promise<Output> {
      await this.companyRepository.delete(input.id)
    }
  }
}
