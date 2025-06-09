import { CompanyEntity, CompanyProps } from '../../company.entity'
import { CompanyDataBuilder } from '@/companies/domain/testing/helpers/company-data-builder'

describe('CompanyEntity unit tests', () => {
  let props: CompanyProps
  let sut: CompanyEntity

  beforeEach(() => {
    CompanyEntity.validate = jest.fn()
    props = CompanyDataBuilder({})
    sut = new CompanyEntity(props)
  })

  it('Constructor method', () => {
    expect(CompanyEntity.validate).toHaveBeenCalled()
    expect(sut.props.name).toEqual(props.name)
    expect(sut.props.category).toEqual(props.category)
    expect(sut.props.createdAt).toBeInstanceOf(Date)
    expect(sut.props.updatedAt).toBeInstanceOf(Date)
    expect(sut.props.deletedAt).toBeInstanceOf(Date)
  })

  it('Getter of name field', () => {
    expect(sut.name).toBeDefined()
    expect(sut.name).toEqual(props.name)
    expect(typeof sut.name).toBe('string')
  })

  it('Setter of name field', () => {
    sut['name'] = 'other name'
    expect(sut.props.name).toEqual('other name')
    expect(typeof sut.props.name).toBe('string')
  })

  it('Getter of category field', () => {
    expect(sut.category).toBeDefined()
    expect(sut.category).toEqual(props.category)
    expect(typeof sut.category).toBe('string')
  })

  it('Setter of category field', () => {
    sut['category'] = 'other category'
    expect(sut.props.category).toEqual('other category')
    expect(typeof sut.props.category).toBe('string')
  })

  it('Getter of createdAt field', () => {
    expect(sut.createdAt).toBeDefined()
    expect(sut.createdAt).toBeInstanceOf(Date)
  })

  it('Getter of updatedAt field', () => {
    expect(sut.updatedAt).toBeDefined()
    expect(sut.updatedAt).toBeInstanceOf(Date)
  })

  it('Getter of deletedAt field', () => {
    expect(sut.deletedAt).toBeDefined()
    expect(sut.deletedAt).toBeInstanceOf(Date)
  })

  it('Should update a company', () => {
    expect(CompanyEntity.validate).toHaveBeenCalled()
    sut.updateName('other name')
    expect(sut.props.name).toEqual('other name')
  })

  it('Should update the category field', () => {
    expect(CompanyEntity.validate).toHaveBeenCalled()
    sut.updateCategory('other category')
    expect(sut.props.category).toEqual('other category')
  })
})
