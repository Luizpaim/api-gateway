import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { BadRequestError } from '@/shared/application/errors/bad-request-error'
import { CompanyOutput, CompanyOutputMapper } from '../dtos/company-output'
import { CompanyRepository } from '@/companies/domain/repositories/company.repository'

export namespace UpdateCompanyUseCase {
  export type Input = {
    id: string
    name: string
    category?: string
  }

  export type Output = CompanyOutput

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly companyRepository: CompanyRepository.Repository,
    ) {}

    async execute(input: Input): Promise<Output> {
      if (!input.name) {
        throw new BadRequestError('Name not provided')
      }

      const entity = await this.companyRepository.findById(input.id)

      entity.updateName(input.name)

      await this.companyRepository.update(entity)

      const company = CompanyOutputMapper.toOutput(entity)

      return company
    }
  }
}
