import { CompanyProps } from '@/companies/domain/entities/company.entity'
import {
  CompanyRules,
  CompanyValidator,
  CompanyValidatorFactory,
} from '../../company.validator'
import { CompanyDataBuilder } from '@/companies/domain/testing/helpers/company-data-builder'

let sut: CompanyValidator
let props: CompanyProps

describe('CompanyValidator unit tests', () => {
  beforeEach(() => {
    sut = CompanyValidatorFactory.create()
    props = CompanyDataBuilder({})
  })

  it('Invalidation cases for name field', () => {
    let isValid = sut.validate(null as any)
    expect(isValid).toBeFalsy()
    expect(sut.errors['name']).toStrictEqual([
      'name should not be empty',
      'name must be a string',
      'name must be shorter than or equal to 255 characters',
    ])

    isValid = sut.validate({ ...props, name: '' })
    expect(isValid).toBeFalsy()
    expect(sut.errors['name']).toStrictEqual(['name should not be empty'])

    isValid = sut.validate({ ...props, name: 10 as any })
    expect(isValid).toBeFalsy()
    expect(sut.errors['name']).toStrictEqual([
      'name must be a string',
      'name must be shorter than or equal to 255 characters',
    ])

    isValid = sut.validate({ ...props, name: 'a'.repeat(256) })
    expect(isValid).toBeFalsy()
    expect(sut.errors['name']).toStrictEqual([
      'name must be shorter than or equal to 255 characters',
    ])
  })

  it('Invalidation cases for category field', () => {
    let isValid = sut.validate(null as any)
    expect(isValid).toBeFalsy()
    expect(sut.errors['category']).toStrictEqual([
      'category should not be empty',
      'category must be a string',
      'category must be shorter than or equal to 100 characters',
    ])

    isValid = sut.validate({ ...props, category: '' })
    expect(isValid).toBeFalsy()
    expect(sut.errors['category']).toStrictEqual([
      'category should not be empty',
    ])

    isValid = sut.validate({ ...props, category: 10 as any })
    expect(isValid).toBeFalsy()
    expect(sut.errors['category']).toStrictEqual([
      'category must be a string',
      'category must be shorter than or equal to 100 characters',
    ])

    isValid = sut.validate({ ...props, category: 'a'.repeat(256) })
    expect(isValid).toBeFalsy()
    expect(sut.errors['category']).toStrictEqual([
      'category must be shorter than or equal to 100 characters',
    ])
  })

  it('Invalidation cases for createdAt field', () => {
    let isValid = sut.validate({ ...props, createdAt: 10 as any })
    expect(isValid).toBeFalsy()
    expect(sut.errors['createdAt']).toStrictEqual([
      'createdAt must be a Date instance',
    ])

    isValid = sut.validate({ ...props, createdAt: '2023' as any })
    expect(isValid).toBeFalsy()
    expect(sut.errors['createdAt']).toStrictEqual([
      'createdAt must be a Date instance',
    ])
  })

  it('Invalidation cases for updatedAt field', () => {
    let isValid = sut.validate({ ...props, updatedAt: 10 as any })
    expect(isValid).toBeFalsy()
    expect(sut.errors['updatedAt']).toStrictEqual([
      'updatedAt must be a Date instance',
    ])

    isValid = sut.validate({ ...props, updatedAt: '2023' as any })
    expect(isValid).toBeFalsy()
    expect(sut.errors['updatedAt']).toStrictEqual([
      'updatedAt must be a Date instance',
    ])
  })

  it('Invalidation cases for deletedAt field', () => {
    let isValid = sut.validate({ ...props, deletedAt: 10 as any })
    expect(isValid).toBeFalsy()
    expect(sut.errors['deletedAt']).toStrictEqual([
      'deletedAt must be a Date instance',
    ])

    isValid = sut.validate({ ...props, deletedAt: '2023' as any })
    expect(isValid).toBeFalsy()
    expect(sut.errors['deletedAt']).toStrictEqual([
      'deletedAt must be a Date instance',
    ])
  })

  it('Valid case for company rules', () => {
    const isValid = sut.validate(props)
    expect(isValid).toBeTruthy()
    expect(sut.validatedData).toStrictEqual(new CompanyRules(props))
  })
})
