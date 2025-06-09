import { CompanyEntity } from '@/companies/domain/entities/company.entity'

export type CompanyOutput = {
  id: string
  name: string
  category: string
  createdAt: Date
  updatedAt: Date
}

export class CompanyOutputMapper {
  static toOutput(entity: CompanyEntity): CompanyOutput {
    return entity.toJSON()
  }
}
