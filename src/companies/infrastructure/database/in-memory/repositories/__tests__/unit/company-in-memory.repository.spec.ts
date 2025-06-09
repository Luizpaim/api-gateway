import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { CompanyEntity } from '@/companies/domain/entities/company.entity'
import { CompanyDataBuilder } from '@/companies/domain/testing/helpers/company-data-builder'
import { CompanyInMemoryRepository } from '../../company-in-memory.repository'

describe('CompanyInMemoryRepository unit tests', () => {
  let sut: CompanyInMemoryRepository

  beforeEach(() => {
    sut = new CompanyInMemoryRepository()
  })

  it('Should throw error when not found - nameExists method', async () => {
    const entity = new CompanyEntity(CompanyDataBuilder({}))
    await sut.insert(entity)
    await expect(sut.nameExists(entity.name)).rejects.toThrow(
      new ConflictError('Name address already used'),
    )
  })

  it('Should find a entity by name - nameExists method', async () => {
    expect.assertions(0)
    await sut.nameExists('new Name')
  })

  it('Should no filter items when filter object is null', async () => {
    const entity = new CompanyEntity(CompanyDataBuilder({}))
    await sut.insert(entity)
    const result = await sut.findAll()
    const spyFilter = jest.spyOn(result, 'filter')
    const itemsFiltered = await sut['applyFilter'](result, null)
    expect(spyFilter).not.toHaveBeenCalled()
    expect(itemsFiltered).toStrictEqual(result)
  })

  it('Should filter name field using filter param', async () => {
    const items = [
      new CompanyEntity(CompanyDataBuilder({ name: 'Test' })),
      new CompanyEntity(CompanyDataBuilder({ name: 'TEST' })),
      new CompanyEntity(CompanyDataBuilder({ name: 'fake' })),
    ]
    const spyFilter = jest.spyOn(items, 'filter')
    const itemsFiltered = await sut['applyFilter'](items, 'TEST')
    expect(spyFilter).toHaveBeenCalled()
    expect(itemsFiltered).toStrictEqual([items[0], items[1]])
  })

  it('Should sort by createAt when sort param is null', async () => {
    const createdAt = new Date()

    const items = [
      new CompanyEntity(CompanyDataBuilder({ name: 'Test', createdAt })),
      new CompanyEntity(
        CompanyDataBuilder({
          name: 'TEST',
          createdAt: new Date(createdAt.getTime() + 1),
        }),
      ),
      new CompanyEntity(
        CompanyDataBuilder({
          name: 'fake',
          createdAt: new Date(createdAt.getTime() + 2),
        }),
      ),
    ]
    const itemsSorted = await sut['applySort'](items, null, null)
    expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]])
  })

  it('Should sort by name field', async () => {
    const createdAt = new Date()
    const items = [
      new CompanyEntity(CompanyDataBuilder({ name: 'c' })),
      new CompanyEntity(
        CompanyDataBuilder({
          name: 'd',
        }),
      ),
      new CompanyEntity(
        CompanyDataBuilder({
          name: 'a',
        }),
      ),
    ]
    let itemsSorted = await sut['applySort'](items, 'name', 'asc')
    expect(itemsSorted).toStrictEqual([items[2], items[0], items[1]])

    itemsSorted = await sut['applySort'](items, 'name', null)
    expect(itemsSorted).toStrictEqual([items[1], items[0], items[2]])
  })
})
