import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'
import { RedisCacheProvider } from '@/shared/application/providers/redis-cache.provider'
import { CompanyOutput, CompanyOutputMapper } from '../dtos/company-output'
import { CompanyRepository } from '@/companies/domain/repositories/company.repository'

export namespace GetCompanyUseCase {
  export type Input = {
    id: string
  }

  export type Output = CompanyOutput

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(
      private readonly companyRepository: CompanyRepository.Repository,
      private readonly redisCacheProvider: RedisCacheProvider,
    ) {}

    async execute(input: Input): Promise<Output> {
      const cacheKey = `company:${input.id}`

      const companyCached =
        await this.redisCacheProvider.getCache<CompanyOutput>(cacheKey)

      if (companyCached) return companyCached

      const entity = await this.companyRepository.findById(input.id)

      const company = CompanyOutputMapper.toOutput(entity)

      await this.redisCacheProvider.setCache({
        cacheKey,
        data: company,
        time: 60,
      })

      return company
    }
  }
}
