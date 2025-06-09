import { BadRequestError } from '../../../shared/application/errors/bad-request-error'
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { CompanyOutput, CompanyOutputMapper } from '../dtos/company-output'
import { CompanyRepository } from '@/companies/domain/repositories/company.repository'
import { CompanyEntity } from '@/companies/domain/entities/company.entity'

export namespace SignupUseCase {
  export type Input = {
    name: string
    category: string
  }

  export type Output = CompanyOutput

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly companyRepository: CompanyRepository.Repository,
    ) {}

    async execute(input: Input): Promise<Output> {
      const { category, name } = input

      if (!name || !category) {
        throw new BadRequestError('Input data not provided')
      }

      await this.companyRepository.nameExists(name)

      const entity = new CompanyEntity(Object.assign(input))

      await this.companyRepository.insert(entity)
      const company = CompanyOutputMapper.toOutput(entity)

      return company
    }
  }
}
