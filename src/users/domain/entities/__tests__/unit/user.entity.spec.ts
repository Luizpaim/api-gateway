import { UserEntity, UserProps } from '../../user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'

describe('UserEntity unit tests', () => {
  let props: UserProps
  let sut: UserEntity

  beforeEach(() => {
    UserEntity.validate = jest.fn()
    props = UserDataBuilder({})
    sut = new UserEntity(props)
  })

  it('Constructor method', () => {
    expect(UserEntity.validate).toHaveBeenCalled()
    expect(sut.props.name).toEqual(props.name)
    expect(sut.props.email).toEqual(props.email)
    expect(sut.props.companyId).toEqual(props.companyId)
    expect(sut.props.password).toEqual(props.password)
    expect(sut.props.createdAt).toBeInstanceOf(Date)
    expect(sut.props.updatedAt).toBeInstanceOf(Date)
  })

  it('Getter of companyId field', () => {
    expect(sut.companyId).toBeDefined()
    expect(sut.companyId).toEqual(props.companyId)
    expect(typeof sut.companyId).toBe('string')
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

  it('Getter of email field', () => {
    expect(sut.email).toBeDefined()
    expect(sut.email).toEqual(props.email)
    expect(typeof sut.email).toBe('string')
  })

  it('Getter of password field', () => {
    expect(sut.password).toBeDefined()
    expect(sut.password).toEqual(props.password)
    expect(typeof sut.password).toBe('string')
  })

  it('Setter of password field', () => {
    sut['password'] = 'other password'
    expect(sut.props.password).toEqual('other password')
    expect(typeof sut.props.password).toBe('string')
  })

  it('Getter of createdAt field', () => {
    expect(sut.createdAt).toBeDefined()
    expect(sut.createdAt).toBeInstanceOf(Date)
  })

  it('Getter of updatedAt field', () => {
    expect(sut.updatedAt).toBeDefined()
    expect(sut.updatedAt).toBeInstanceOf(Date)
  })

  it('Setter of updatedAt field', () => {
    const date = new Date()
    sut['updatedAt'] = date
    expect(sut.props.updatedAt).toEqual(date)
    expect(sut.updatedAt).toBeInstanceOf(Date)
  })

  it('Getter of deletedAt field', () => {
    expect(sut.deletedAt).toBeNull()
  })

  it('Setter of deletedAt field', () => {
    const date = new Date()
    sut['deletedAt'] = date
    expect(sut.props.deletedAt).toEqual(date)
    expect(sut.deletedAt).toBeInstanceOf(Date)
  })

  it('Should update a user', () => {
    expect(UserEntity.validate).toHaveBeenCalled()
    sut.update('other name')
    expect(sut.props.name).toEqual('other name')
  })

  it('Should update the password field', () => {
    expect(UserEntity.validate).toHaveBeenCalled()
    sut.updatePassword('other password')
    expect(sut.props.password).toEqual('other password')
  })

  it('Should update the updatedAt field', () => {
    const date = new Date()
    expect(UserEntity.validate).toHaveBeenCalled()
    sut.refreshUpdatedAt(date)
    expect(sut.props.updatedAt).toEqual(date)
  })

  it('Should deleted the updatedAt field', () => {
    const date = new Date()
    expect(UserEntity.validate).toHaveBeenCalled()
    sut.setDeletedAt(date)
    expect(sut.props.deletedAt).toEqual(date)
  })
})
