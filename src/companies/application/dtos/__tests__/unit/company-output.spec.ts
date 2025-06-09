import { CompanyEntity } from '@/companies/domain/entities/company.entity'
import { CompanyDataBuilder } from '@/companies/domain/testing/helpers/company-data-builder'
import { CompanyOutputMapper } from '../../company-output'

describe('CompanyOutputMapper unit tests', () => {
  it('should convert a user in output', () => {
    const entity = new CompanyEntity(CompanyDataBuilder({}))
    const spyToJson = jest.spyOn(entity, 'toJSON')
    const sut = CompanyOutputMapper.toOutput(entity)

    expect(spyToJson).toHaveBeenCalled()
    expect(sut).toStrictEqual(entity.toJSON())
  })
})
