import { SignupDto } from '../../dtos/signup.dto'
import { CompaniesController } from '../../companies.controller'
import { CompanyOutput } from '@/companies/application/dtos/company-output'
import { SignupUseCase } from '@/companies/application/usecases/signup.usecase'
import {
  CompanyCollectionPresenter,
  CompanyPresenter,
} from '../../presenters/company.presenter'
import { ListCompaniesUseCase } from '@/companies/application/usecases/listcompanies.usecase'
import { UpdateCompanyUseCase } from '@/companies/application/usecases/update-company.usecase'

import { UpdateCompanyDto } from '../../dtos/update-company.dto'
import { GetCompanyUseCase } from '@/companies/application/usecases/getcompany.usecase'

describe('CompaniesController unit tests', () => {
  let sut: CompaniesController
  let id: string
  let props: CompanyOutput

  beforeEach(async () => {
    sut = new CompaniesController()
    id = 'df96ae94-6128-486e-840c-b6f78abb4801'
    props = {
      id,
      name: 'Jhon Doe',
      category: 'a@a.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should create a company', async () => {
    const output: SignupUseCase.Output = props
    const mockSignupUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    sut['signupUseCase'] = mockSignupUseCase as any
    const input: SignupDto = {
      name: 'Jhon Doe',
      category: 'a@a.com',
    }
    const presenter = await sut.create(input)
    expect(presenter).toBeInstanceOf(CompanyPresenter)
    expect(presenter).toStrictEqual(new CompanyPresenter(output))
    expect(mockSignupUseCase.execute).toHaveBeenCalledWith(input)
  })

  it('should update a company', async () => {
    const output: UpdateCompanyUseCase.Output = props
    const mockUpdateCompanyUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    sut['updateCompanyUseCase'] = mockUpdateCompanyUseCase as any
    const input: UpdateCompanyDto = {
      name: 'new name',
      category: 'new category',
    }
    const presenter = await sut.update(id, input)
    expect(presenter).toBeInstanceOf(CompanyPresenter)
    expect(presenter).toStrictEqual(new CompanyPresenter(output))
    expect(mockUpdateCompanyUseCase.execute).toHaveBeenCalledWith({
      id,
      ...input,
    })
  })

  it('should delete a company', async () => {
    const output = undefined
    const mockDeleteCompanyUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    sut['deleteCompanyUseCase'] = mockDeleteCompanyUseCase as any
    const result = await sut.remove(id)
    expect(output).toStrictEqual(result)
    expect(mockDeleteCompanyUseCase.execute).toHaveBeenCalledWith({
      id,
    })
  })

  it('should gets a company', async () => {
    const output: GetCompanyUseCase.Output = props
    const mockGetCompanyUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    sut['getCompanyUseCase'] = mockGetCompanyUseCase as any
    const presenter = await sut.findOne(id)
    expect(presenter).toBeInstanceOf(CompanyPresenter)
    expect(presenter).toStrictEqual(new CompanyPresenter(output))
    expect(mockGetCompanyUseCase.execute).toHaveBeenCalledWith({
      id,
    })
  })

  it('should list companies', async () => {
    const output: ListCompaniesUseCase.Output = {
      items: [props],
      currentPage: 1,
      lastPage: 1,
      perPage: 1,
      total: 1,
    }
    const mockListCompaniesUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }
    sut['listCompaniesUseCase'] = mockListCompaniesUseCase as any
    const searchParams = {
      page: 1,
      perPage: 1,
    }
    const presenter = await sut.search(searchParams)
    expect(presenter).toBeInstanceOf(CompanyCollectionPresenter)
    expect(presenter).toEqual(new CompanyCollectionPresenter(output))
    expect(mockListCompaniesUseCase.execute).toHaveBeenCalledWith(searchParams)
  })
})
