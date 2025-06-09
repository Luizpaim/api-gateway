import { EntityValidationError } from '@/shared/domain/errors/validation-error'
import { CompanyEntity, CompanyProps } from '../../company.entity'
import { CompanyDataBuilder } from '@/companies/domain/testing/helpers/company-data-builder'

describe('CompanyEntity integration tests', () => {
  describe('Constructor method', () => {
    it('Should throw an error when creating a company with invalid name', () => {
      let props: CompanyProps = {
        ...CompanyDataBuilder({}),
        name: null,
      }
      expect(() => new CompanyEntity(props)).toThrow(EntityValidationError)

      props = {
        ...CompanyDataBuilder({}),
        name: '',
      }
      expect(() => new CompanyEntity(props)).toThrow(EntityValidationError)

      props = {
        ...CompanyDataBuilder({}),
        name: 10 as any,
      }
      expect(() => new CompanyEntity(props)).toThrow(EntityValidationError)

      props = {
        ...CompanyDataBuilder({}),
        name: 'a'.repeat(256),
      }
      expect(() => new CompanyEntity(props)).toThrow(EntityValidationError)
    })

    it('Should throw an error when creating a company with invalid category', () => {
      let props: CompanyProps = {
        ...CompanyDataBuilder({}),
        category: null,
      }
      expect(() => new CompanyEntity(props)).toThrow(EntityValidationError)

      props = {
        ...CompanyDataBuilder({}),
        category: '',
      }
      expect(() => new CompanyEntity(props)).toThrow(EntityValidationError)

      props = {
        ...CompanyDataBuilder({}),
        category: 10 as any,
      }
      expect(() => new CompanyEntity(props)).toThrow(EntityValidationError)

      props = {
        ...CompanyDataBuilder({}),
        category: 'a'.repeat(101),
      }
      expect(() => new CompanyEntity(props)).toThrow(EntityValidationError)
    })

    it('Should throw an error when creating a company with invalid createdAt', () => {
      let props: CompanyProps = {
        ...CompanyDataBuilder({}),
        createdAt: '2023' as any,
      }
      expect(() => new CompanyEntity(props)).toThrow(EntityValidationError)

      props = {
        ...CompanyDataBuilder({}),
        createdAt: 10 as any,
      }
      expect(() => new CompanyEntity(props)).toThrow(EntityValidationError)
    })

    it('Should throw an error when creating a company with invalid updatedAt', () => {
      let props: CompanyProps = {
        ...CompanyDataBuilder({}),
        updatedAt: '2023' as any,
      }
      expect(() => new CompanyEntity(props)).toThrow(EntityValidationError)

      props = {
        ...CompanyDataBuilder({}),
        updatedAt: 10 as any,
      }
      expect(() => new CompanyEntity(props)).toThrow(EntityValidationError)
    })

    it('Should throw an error when creating a company with invalid deletedAt', () => {
      let props: CompanyProps = {
        ...CompanyDataBuilder({}),
        deletedAt: '2023' as any,
      }
      expect(() => new CompanyEntity(props)).toThrow(EntityValidationError)

      props = {
        ...CompanyDataBuilder({}),
        deletedAt: 10 as any,
      }
      expect(() => new CompanyEntity(props)).toThrow(EntityValidationError)
    })

    it('Should a valid company', () => {
      expect.assertions(0)

      const props: CompanyProps = {
        ...CompanyDataBuilder({}),
      }
      new CompanyEntity(props)
    })
  })

  describe('Update method', () => {
    it('Should throw an error when update a company with invalid name', () => {
      const entity = new CompanyEntity(CompanyDataBuilder({}))
      expect(() => entity.updateName(null)).toThrow(EntityValidationError)
      expect(() => entity.updateName('')).toThrow(EntityValidationError)
      expect(() => entity.updateName(10 as any)).toThrow(EntityValidationError)
      expect(() => entity.updateName('a'.repeat(256))).toThrow(
        EntityValidationError,
      )
    })

    it('Should a valid company', () => {
      expect.assertions(0)

      const props: CompanyProps = {
        ...CompanyDataBuilder({}),
      }

      const entity = new CompanyEntity(props)
      entity.updateName('other name')
    })
  })

  describe('UpdateCategory method', () => {
    it('Should a invalid company using category field', () => {
      const entity = new CompanyEntity(CompanyDataBuilder({}))
      expect(() => entity.updateCategory(null)).toThrow(EntityValidationError)
      expect(() => entity.updateCategory('')).toThrow(EntityValidationError)
      expect(() => entity.updateCategory(10 as any)).toThrow(
        EntityValidationError,
      )
      expect(() => entity.updateCategory('a'.repeat(101))).toThrow(
        EntityValidationError,
      )
    })

    it('Should a valid company', () => {
      expect.assertions(0)

      const props: CompanyProps = {
        ...CompanyDataBuilder({}),
      }

      const entity = new CompanyEntity(props)
      entity.updateCategory('other category')
    })
  })
})
